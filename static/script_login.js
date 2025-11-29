(function(){
  const form = document.getElementById('loginForm');
  const feedback = document.getElementById('feedback');
  const user = document.getElementById('username');
  const pass = document.getElementById('password');
  const toggle = document.getElementById('togglePass');

  toggle?.addEventListener('click', () => {
    const shown = pass.type === 'text';
    pass.type = shown ? 'password' : 'text';
    toggle.textContent = shown ? 'Mostrar' : 'Ocultar';
    toggle.setAttribute('aria-pressed', (!shown).toString());
  });

  // Validación visual simple
  function showMessage(text, type='error'){
    if(!feedback) return;
    feedback.style.display = 'block';
    feedback.textContent = text;
    feedback.className = 'msg ' + (type === 'error' ? 'error' : 'success');
  }
  function hideMessage(){ if(feedback){ feedback.style.display = 'none'; feedback.textContent = ''; } }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    hideMessage();

    const vUser = user?.value.trim() || '';
    const vPass = pass?.value || '';

    if(!vUser || vUser.length < 3){
      showMessage('El usuario debe tener al menos 3 caracteres', 'error');
      user.focus();
      return;
    }
    if(!vPass || vPass.length < 4){
      showMessage('La contraseña debe tener al menos 4 caracteres', 'error');
      pass.focus();
      return;
    }

    // Mensaje de éxito breve antes de redirigir
    showMessage('Credenciales validadas. Redirigiendo...', 'success');

    // redirigir con parámetros codificados
    const u = encodeURIComponent(vUser);
    const p = encodeURIComponent(vPass);

    setTimeout(() => {
      hideMessage();
      window.location.href = `/login/validate/${u}/${p}`;
    }, 700);
  });

  // Mejora UX: hints dinámicos
  user?.addEventListener('input', () => {
    const hint = document.getElementById('userHint');
    if(!hint) return;
    hint.textContent = user.value.length === 0 ? 'Introduce tu usuario' : 'Pulsa Entrar para continuar';
  });

  // Accesibilidad: Enter en contraseña envía formulario
  pass?.addEventListener('keyup', (ev) => {
    if(ev.key === 'Enter') form?.dispatchEvent(new Event('submit', {cancelable:true}));
  });
})();