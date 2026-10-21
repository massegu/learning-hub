"""Exercise deploy/restore boundaries offline; never uses a real credential."""
import contextlib,importlib.util,io,json,os,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('deploy',ROOT/'scripts/deploy-supabase.py');deploy=importlib.util.module_from_spec(spec);spec.loader.exec_module(deploy)
class Deployment(unittest.TestCase):
 def test_package_has_all_imports_and_keeps_authentication(self):
  folder,files=deploy.sources();body,kind=deploy.multipart(folder,files)
  self.assertEqual(len(files),15);self.assertIn(b'"verify_jwt": true',body)
  self.assertIn(b'filename="data/teen.js"',body);self.assertIn(b'filename="document-library.js"',body);self.assertIn(b'filename="photo-library.js"',body)
  self.assertIn('multipart/form-data',kind);self.assertNotIn(b'sbp_',body)
 def test_missing_key_and_wrong_project_are_rejected(self):
  with self.assertRaises(ValueError):deploy.Management('wrong','not-a-real-token')
  with self.assertRaises(ValueError):deploy.Management('duvdwsbzrivtxgeqvsln','')
 def test_compile_does_not_deploy_and_restore_checks_provenance(self):
  current={'slug':deploy.FUNCTION,'version':38,'status':'ACTIVE','verify_jwt':True,'ezbr_sha256':'old'}
  calls=[]
  def request(_self,path,method='GET',data=None,kind=None):
   calls.append((path,method));return dict(current)
  with patch.dict(os.environ,{'SUPABASE_ACCESS_TOKEN':'offline-placeholder'}),patch.object(deploy.Management,'request',request),patch('sys.argv',['deploy','--check','--project-ref','duvdwsbzrivtxgeqvsln']),contextlib.redirect_stdout(io.StringIO()):deploy.main()
  self.assertEqual(sum(method=='POST' for _,method in calls),1)
  self.assertTrue(all(method!='POST' or 'bundleOnly=true' in path for path,method in calls))
  with tempfile.TemporaryDirectory() as tmp:
   copy=Path(tmp)/'old.eszip';copy.write_bytes(b'old-bundle');copy.with_suffix('.json').write_text(json.dumps({'_project_ref':'b'*20,'slug':deploy.FUNCTION}))
   with patch.dict(os.environ,{'SUPABASE_ACCESS_TOKEN':'offline-placeholder'}),patch.object(deploy.Management,'request',request),patch('sys.argv',['deploy','--restore',str(copy),'--project-ref','duvdwsbzrivtxgeqvsln']):
    with self.assertRaisesRegex(ValueError,'no corresponde'):deploy.main()
 def test_deploy_saves_verified_backup_before_mutation_and_confirms_version(self):
  state={'slug':deploy.FUNCTION,'version':38,'status':'ACTIVE','verify_jwt':True,'ezbr_sha256':'old'};calls=[]
  def request(_self,path,method='GET',data=None,kind=None):
   calls.append(path)
   if path.endswith('/body'):return b'original-eszip'
   if method=='POST' and 'bundleOnly' not in path:state.update(version=39,ezbr_sha256='new')
   return dict(state)
  with tempfile.TemporaryDirectory() as tmp,patch.dict(os.environ,{'SUPABASE_ACCESS_TOKEN':'offline-placeholder'}),patch.object(deploy.Management,'request',request),patch('sys.argv',['deploy','--deploy','--project-ref','duvdwsbzrivtxgeqvsln','--backup-dir',tmp]),contextlib.redirect_stdout(io.StringIO()):
   deploy.main();copies=list(Path(tmp).glob('*.eszip'));self.assertEqual(len(copies),1);self.assertEqual(copies[0].read_bytes(),b'original-eszip')
   metadata=json.loads(copies[0].with_suffix('.json').read_text());self.assertEqual(metadata['_project_ref'],'duvdwsbzrivtxgeqvsln');self.assertEqual(metadata['version'],38)
  self.assertLess(next(i for i,path in enumerate(calls) if path.endswith('/body')),next(i for i,path in enumerate(calls) if path.startswith('/deploy?') and 'bundleOnly' not in path))
if __name__=='__main__':unittest.main()
