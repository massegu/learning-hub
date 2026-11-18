"""Private, manifest-bound prepare/execute/validate/cleanup E2E lifecycle.

This release has no remote drivers. It records real staging cases as NOT RUN.
"""
import argparse
import json
from pathlib import Path

from .common import (ROOT, GuardError, canonical, digest, load_manifest, output_directory,
                     private_json, require, tool_digest, validate_manifest, write_private)
from .scenarios import CASES, Context, run_suite


def load_plan(manifest, directory, root=ROOT):
    validate_manifest(manifest,root)
    directory=Path(directory)
    require(not directory.is_symlink(), 'Run directory symlink refused')
    plan=private_json(directory/'plan.json',root)
    require(plan=={'version':1,'kind':'offline-staging-e2e','manifest_digest':digest(canonical(manifest)),
                   'tool_digest':tool_digest(),
                   'cases':[name for name,_,_ in CASES],'remote_execution_enabled':False}, 'Run plan changed or bound to another destination')
    return directory


def prepare(manifest,directory,root=ROOT):
    validate_manifest(manifest,root)
    directory=output_directory(directory,root)
    write_private(directory/'plan.json',{'version':1,'kind':'offline-staging-e2e','manifest_digest':digest(canonical(manifest)),
                  'tool_digest':tool_digest(),
                  'cases':[name for name,_,_ in CASES],'remote_execution_enabled':False})
    write_private(directory/'transient.json',{'manifest_digest':digest(canonical(manifest)),
                  'actors':['A','B'],'created_remote_ids':[]})
    return {'status':'PASSED','basis':'OFFLINE_PREPARATION','remote_operations':0}


def execute(manifest,directory,root=ROOT):
    directory=load_plan(manifest,directory,root)
    context=Context(manifest)
    results=run_suite(context)
    write_private(directory/'results.json',{'kind':'offline-staging-e2e-results',
                  'manifest_digest':digest(canonical(manifest)),'remote_operations':0,'cases':results})
    return {'status':'NOT RUN','basis':'REAL_STAGING','cases':results,'remote_operations':0}


def validate(manifest,directory,root=ROOT):
    directory=load_plan(manifest,directory,root)
    result=private_json(directory/'results.json',root)
    expected=run_suite(Context(manifest))
    require(result=={'kind':'offline-staging-e2e-results','manifest_digest':digest(canonical(manifest)),
                     'remote_operations':0,'cases':expected}, 'Invalid report or unsupported claim of remote validation')
    report={'status':'NOT RUN','basis':'REAL_STAGING','record_validation':'PASSED',
            'totals':{'PASSED':0,'FAILED':0,'NOT RUN':len(expected)},'remote_operations':0}
    write_private(directory/'validation.json',report)
    return report


def cleanup(manifest,directory,root=ROOT):
    directory=load_plan(manifest,directory,root)
    state=private_json(directory/'transient.json',root)
    require(state=={'manifest_digest':digest(canonical(manifest)),'actors':['A','B'],'created_remote_ids':[]},
            'Unexpected resource ledger; refusing any deletion')
    # Only this known local transient file is removed. Reports remain reviewable.
    (directory/'transient.json').unlink()
    report={'status':'PASSED','basis':'LOCAL_TRANSIENT_CLEANUP','remote_cleanup':'NOT RUN','remote_operations':0}
    write_private(directory/'cleanup.json',report)
    return report


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase',choices=['prepare','execute','validate','cleanup'])
    parser.add_argument('--manifest',required=True)
    parser.add_argument('--run-dir',required=True)
    args=parser.parse_args()
    try:
        result=globals()[args.phase](load_manifest(args.manifest),args.run_dir)
        print(json.dumps(result))
    except (GuardError,OSError,ValueError,KeyError):
        parser.exit(2,'Staging runner refused the phase; review private state and prerequisites.\n')


if __name__=='__main__':
    main()
