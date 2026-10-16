(function(){
  'use strict';
  const API=window.LearningAPI,dialog=document.querySelector('#passwordDialog');
  if(!API||!dialog)return;
  const form=document.querySelector('#passwordForm'),message=document.querySelector('#passwordMessage');
  const save=document.querySelector('#savePassword'),close=document.querySelector('#closePassword');
  const input=document.querySelector('#newPassword'),repeat=document.querySelector('#repeatPassword');
  const requested=new URL(window.location.href).searchParams.get('recuperar')==='1'||/(?:^#|&)type=recovery(?:&|$)/.test(window.location.hash);
  let recovery=requested,saved=false,busy=false;
  function clearRecoveryURL(){
    const url=new URL(window.location.href);url.searchParams.delete('recuperar');
    // Supabase handles the session tokens. Remove any remainder from browser history.
    if(/(?:access_token|refresh_token|type=recovery|error_description)=/.test(url.hash))url.hash='';
    window.history.replaceState(null,'',url.pathname+url.search+url.hash);
  }
  function open(isRecovery=false){
    recovery=isRecovery; saved=false;busy=false;form.reset();
    input.disabled=false;repeat.disabled=false;save.hidden=false;save.disabled=false;
    close.disabled=false;close.textContent='Cancelar';message.textContent='';
    document.querySelector('#passwordTitle').textContent=isRecovery?'Elige tu nueva contraseña':'Cambiar contraseña';
    if(!dialog.open)dialog.showModal();input.focus();
  }
  async function finish(){
    if(busy)return;
    const wasRecovery=recovery;dialog.close();form.reset();message.textContent='';
    recovery=false;clearRecoveryURL();
    if(wasRecovery){
      if(!saved)await API.signOut();
      window.dispatchEvent(new Event('lh:account-access-ready'));
    }
  }
  document.querySelector('#changePasswordBtn').addEventListener('click',()=>open(false));
  close.addEventListener('click',finish);
  dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||saved)return;
    message.textContent='';
    if(input.value.length<8){message.textContent='La contraseña debe tener al menos 8 caracteres.';return;}
    if(input.value!==repeat.value){message.textContent='Las dos contraseñas no coinciden.';repeat.focus();return;}
    busy=true;save.disabled=true;close.disabled=true;
    try{
      await API.changePassword(input.value);saved=true;form.reset();input.disabled=true;repeat.disabled=true;
      save.hidden=true;close.textContent='Continuar';message.textContent='Contraseña actualizada. Ya puedes utilizar la nueva contraseña.';
    }catch(error){message.textContent=error.message||'No se pudo cambiar la contraseña. Inténtalo de nuevo.';}
    finally{busy=false;save.disabled=false;close.disabled=false;}
  });
  const forgot=document.querySelector('#authForgotPassword');
  forgot.addEventListener('click',async()=>{
    const email=document.querySelector('#authEmail'),status=document.querySelector('#authMessage');
    if(!email.value.trim()||!email.checkValidity()){status.textContent='Escribe un correo válido en el campo Email.';email.focus();return;}
    if(forgot.disabled)return;forgot.disabled=true;
    try{
      await API.resetPassword(email.value.trim());
      status.textContent='Si existe una cuenta con ese correo, recibirás un enlace para elegir otra contraseña. Revisa también la carpeta de correo no deseado.';
    }catch(error){status.textContent=error.message||'No se pudo solicitar el enlace. Inténtalo de nuevo.';}
    finally{forgot.disabled=false;}
  });
  API.client.auth.onAuthStateChange?.((event)=>{
    if(event==='PASSWORD_RECOVERY'){
      recovery=true;
      // No awaited Auth calls inside the Supabase callback (its session lock is held).
      window.setTimeout(()=>open(true),0);
    }
  });
  window.PasswordAccount={recoveryPending:()=>recovery,resumeRecovery(session){
    if(session){open(true);return;}
    document.querySelector('#authMessage').textContent='El enlace de recuperación no es válido o ha caducado. Solicita uno nuevo con «He olvidado mi contraseña».';
    recovery=false;clearRecoveryURL();
  }};
})();
