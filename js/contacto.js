const { useState, useEffect } = React;
const WEBHOOK_URL = 'https://hook.us2.make.com/vnccle9u0ur11dij3xohyf1fu5inwkak';

function Toast({ text, kind = 'success', onClose }){
  useEffect(()=>{
    if(!text) return;
    const t = setTimeout(onClose, 3200);
    return ()=> clearTimeout(t);
  },[text, onClose]);
  if(!text) return null;
  const bg = kind === 'error' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800';
  return (
    <div className={`fixed right-4 bottom-6 z-50 p-3 rounded shadow-sm border ${bg}`} role="status">
      {text}
    </div>
  );
}

function ContactCard(){
  const [form, setForm] = useState({ nombre:'', correo:'', pais:'', telefono:'', mensaje:'' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(''); 
  const [toast, setToast] = useState('');

  useEffect(()=>{
    if(status === 'sent'){
      setToast('Mensaje enviado. Te responderemos pronto.');
      const t = setTimeout(()=> setStatus(''), 2200);
      return ()=> clearTimeout(t);
    }
    if(status === 'error'){
      setToast('No se pudo enviar. Se abrirá tu cliente de correo.');
    }
  },[status]);

  const onChange = (k)=>(e)=> setForm({...form, [k]: e.target.value});

  const validate = ()=>{
    const e = {};
    if(!form.nombre.trim()) e.nombre = 'Requerido';
    if(!form.correo.trim()) e.correo = 'Requerido';
    else if(!/^\S+@\S+\.\S+$/.test(form.correo)) e.correo = 'Email inválido';
    if(!form.mensaje.trim()) e.mensaje = 'Escribe tu mensaje';
    if(!form.telefono || !form.telefono.trim()) e.telefono = 'Requerido';
    else if(!/^[+0-9()\-\s]{6,}$/.test(form.telefono)) e.telefono = 'Teléfono inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fallbackMail = ()=>{
    const body = `Nombre: ${form.nombre}\nEmail: ${form.correo}\nTeléfono: ${form.telefono}\nPais: ${form.pais}\n\n${form.mensaje}`;
    const href = `mailto:contacto@tutienda.com?subject=${encodeURIComponent('Consulta desde web')}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  const submit = async (ev)=>{
    ev.preventDefault();
    setToast('');
    if(!validate()) return;
    setStatus('sending');
    try{
  console.log('Enviando datos de contacto al webhook:', WEBHOOK_URL, form);
  const payload = { source: 'contacto.html', ...form, timestamp: new Date().toISOString() };
  const res = await fetch(WEBHOOK_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if(res.ok){
        setStatus('sent');
        setForm({ nombre:'', correo:'', pais:'', telefono:'', mensaje:'' });
        setErrors({});
      } else {
        console.warn('Webhook respondió con estado no OK:', res.status);
        setStatus('error');
        fallbackMail();
      }
    }catch(err){
      console.error(err);
      setStatus('error');
      fallbackMail();
    }
  };

  return (
    <div className="rc-wrapper max-w-5xl mx-auto p-6">
      <style>{`
        /* Layout más grande para cubrir pantalla */
        .rc-wrapper{display:flex;gap:28px;align-items:stretch;min-height:calc(100vh - 140px);padding-top:18px;padding-bottom:18px}
        .rc-form{flex:1;background:#fff;padding:28px;border-radius:16px;border:1px solid rgba(197,154,107,0.09);box-shadow:0 12px 28px rgba(161,129,99,0.08);min-height:70vh;display:flex;flex-direction:column;justify-content:space-between}
        .rc-side{width:380px;min-width:260px;background:linear-gradient(180deg,#fffaf7,#fff3ea);padding:20px;border-radius:14px;border:1px solid rgba(197,154,107,0.08);display:flex;flex-direction:column;justify-content:space-between}
        .rc-label{display:block;font-weight:700;color:#8a5e3a;margin-bottom:8px;font-size:15px}
        .rc-input{width:100%;padding:14px;border-radius:10px;border:1px solid #eee;margin-bottom:12px;font-size:16px}
        .rc-text{width:100%;min-height:200px;padding:14px;border-radius:10px;border:1px solid #eee;font-size:16px}
        .rc-btn{background:#C59A6B;color:#fff;padding:12px 18px;border-radius:12px;border:none;font-weight:700;font-size:16px}
        .rc-error{color:#b00020;font-size:14px;margin-top:6px}
        .rc-side iframe{width:100%;height:260px;border-radius:10px}

        /* Topbar móvil: mostrar logo y nombre encima del formulario en pantallas pequeñas */
        .rc-topbar{display:none;align-items:center;gap:12px;padding:8px 0 12px;border-bottom:1px solid rgba(0,0,0,0.04);margin-bottom:8px}
        .rc-topbar img{width:44px;height:44px;border-radius:8px;object-fit:cover}
        .rc-topbar .brand{font-weight:700;color:#8a5e3a;font-size:18px}

        @media(max-width:1200px){ .rc-side{width:340px} }
        @media(max-width:900px){
          .rc-topbar{display:flex}
          .rc-wrapper{flex-direction:column;min-height:auto;gap:16px;padding:12px}
          .rc-side{width:100%}
          .rc-form{min-height:auto;padding:20px}
          .rc-btn{width:100%;padding:14px}
          .rc-side-header{display:none}
        }
      `}</style>

      <div className="rc-topbar" role="banner">
        <div style={{width:44,height:44,overflow:'hidden',borderRadius:8,flex:'0 0 auto'}}>
          <img src="imagenes/logoarabella.png" alt="Arabella Chic" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
        </div>
        <div>
          <div className="brand">Arabella Chic</div>
          <div style={{fontSize:13,color:'#6b6b6b'}}>Tienda de calzado femenino</div>
        </div>
      </div>

      <form className="rc-form" onSubmit={submit} noValidate>
        <h3 style={{marginTop:0,color:'#8a5e3a'}}>Contáctanos</h3>
        <p style={{marginTop:6,marginBottom:12,color:'#6b6b6b'}}>Te ayudamos con talles, envíos y disponibilidad.</p>

        <label className="rc-label">Nombre</label>
        <input className="rc-input" value={form.nombre} onChange={onChange('nombre')} aria-label="Nombre" />
        {errors.nombre && <div className="rc-error">{errors.nombre}</div>}

        <label className="rc-label">Correo</label>
        <input className="rc-input" value={form.correo} onChange={onChange('correo')} type="email" aria-label="Correo" />
        {errors.correo && <div className="rc-error">{errors.correo}</div>}

  <label className="rc-label">Teléfono celular</label>
  <input className="rc-input" value={form.telefono} onChange={onChange('telefono')} type="tel" aria-label="Teléfono celular" />
  {errors.telefono && <div className="rc-error">{errors.telefono}</div>}

        <label className="rc-label">País (opcional)</label>
        <input className="rc-input" value={form.pais} onChange={onChange('pais')} aria-label="Pais" />

        <label className="rc-label">Mensaje</label>
        <textarea className="rc-text" value={form.mensaje} onChange={onChange('mensaje')} aria-label="Mensaje" />
        {errors.mensaje && <div className="rc-error">{errors.mensaje}</div>}

        <div style={{marginTop:12,display:'flex',gap:10,alignItems:'center'}}>
          <button className="rc-btn" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Enviando...' : 'Enviar'}</button>
          <button type="button" onClick={fallbackMail} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',background:'#fff'}}>Enviar por email</button>
          {status === 'sent' && <span style={{color:'#8a5e3a',fontWeight:600}}>Enviado ✓</span>}
        </div>
      </form>

      <aside className="rc-side">
        <div className="rc-side-header" style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:56,height:56,borderRadius:10,overflow:'hidden',flex:'0 0 auto'}}>
            <img src="imagenes/logoarabella.png" alt="Arabella Chic" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
          </div>
          <div>
            <div style={{fontWeight:700,color:'#8a5e3a'}}>Arabella Chic</div>
            <div style={{fontSize:13,color:'#6b6b6b'}}>Tienda de calzado femenino</div>
          </div>
        </div>

        <div style={{marginTop:12}}>
          <div style={{fontWeight:600,color:'#8a5e3a'}}>Dirección</div>
          <div style={{fontSize:13,color:'#444'}}>Calle Ejemplo 123, Ciudad</div>
        </div>

        <div style={{marginTop:10}}>
          <div style={{fontWeight:600,color:'#8a5e3a'}}>Horario</div>
          <div style={{fontSize:13,color:'#444'}}>Lun-Vie 9:00-18:00</div>
        </div>

        <div style={{marginTop:12}}>
          <iframe title="mapa" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7769.901094267319!2d-74.22460053410653!3d-13.165518104502462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91127d88f5b2bee9%3A0xe9b3cb843a70a16e!2sAyacucho!5e0!3m2!1ses-419!2spe!4v1763166756871!5m2!1ses-419!2spe" style={{width:'100%',height:160,border:0,borderRadius:8}} allowFullScreen loading="lazy"></iframe>
        </div>
      </aside>

      <Toast text={toast} kind={status === 'error' ? 'error' : 'success'} onClose={()=> setToast('')} />
    </div>
  );
}

function mountContact(){
  try{
    const el = document.getElementById('contacto');
    if(!el){
      console.warn('No existe el contenedor #contacto');
      return false;
    }
  
    if (el.dataset.mounted) return true;

  
    try{
      ReactDOM.createRoot(el).render(React.createElement(ContactCard));
    }catch(err){
    
      console.warn('ReactDOM.createRoot falló, intentando ReactDOM.render', err);
      try{ ReactDOM.render(React.createElement(ContactCard), el); }
      catch(e){
        console.error('ReactDOM.render también falló', e);
        el.innerHTML = '<div style="padding:20px;color:#b00020">Error al cargar el formulario de contacto. Revisa la consola para más detalles.</div>';
        return false;
      }
    }

    el.dataset.mounted = '1';
    console.log('contacto montado correctamente');
    return true;
  }catch(e){
    console.error('Error durante mountContact:', e);
    return false;
  }
}


if (!mountContact()){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountContact);
  } else {
    
    setTimeout(mountContact, 50);
  }
}

window.addEventListener('error', (e) => {
  console.error('Error global detectado:', e.error || e.message || e);
  const el = document.getElementById('contacto');
  if (el && !el.dataset.mounted) {
    el.innerHTML = '<div style="padding:20px;color:#b00020">Ocurrió un error al cargar el componente de contacto. Revisa la consola.</div>';
  }
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Rejection no manejada:', e.reason);
  const el = document.getElementById('contacto');
  if (el && !el.dataset.mounted) {
    el.innerHTML = '<div style="padding:20px;color:#b00020">Ocurrió un error al cargar el componente de contacto. Revisa la consola.</div>';
  }
});
