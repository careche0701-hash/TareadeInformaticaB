const body = document.body;
const themeToggle = document.querySelector('#themeToggle');
const themeIcon = document.querySelector('.theme-icon');
const exportButton = document.querySelector('#exportPdf');
const toast = document.querySelector('#toast');
const progressBar = document.querySelector('#progressBar');

function applyTheme(theme) {
  const dark = theme === 'dark';
  body.classList.toggle('dark', dark);
  themeToggle.setAttribute('aria-label', dark ? 'Activar tema claro' : 'Activar tema oscuro');
  themeIcon.textContent = dark ? '☼' : '◐';
  localStorage.setItem('nucleo-theme', theme);
}

applyTheme(localStorage.getItem('nucleo-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeToggle.addEventListener('click', () => applyTheme(body.classList.contains('dark') ? 'light' : 'dark'));

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 2800);
}

window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
});

document.querySelector('#currentYear').textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const cycleContent = {
  fetch: ['La UC busca la siguiente instrucción.', 'El contador de programa indica dónde encontrarla en memoria.'],
  decode: ['La UC interpreta qué debe hacer la instrucción.', 'Los bits se traducen en señales que coordinan los componentes.'],
  execute: ['La ALU o el componente indicado realiza la operación.', 'El resultado se guarda y el ciclo vuelve a empezar.']
};
document.querySelectorAll('.cycle-step').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.cycle-step').forEach((step) => step.classList.remove('active'));
    button.classList.add('active');
    const [title, description] = cycleContent[button.dataset.step];
    document.querySelector('#cycleOutput strong').textContent = title;
    document.querySelector('#cycleOutput p').textContent = description;
  });
});

const topologyContent = {
  star: { name: 'Estrella', description: 'Todos los dispositivos se conectan a un punto central. Es fácil de administrar y aislar, pero el switch es un punto crítico.', tags: ['Escalable', 'Fácil de mantener', 'Hub crítico'], kicker: 'TOPOLOGÍA 01' },
  ring: { name: 'Anillo', description: 'Cada dispositivo se conecta con dos vecinos formando un circuito. El tráfico sigue una ruta ordenada, pero una interrupción puede afectar el anillo.', tags: ['Ordenada', 'Poco cable', 'Fallo sensible'], kicker: 'TOPOLOGÍA 02' },
  bus: { name: 'Bus', description: 'Todos los dispositivos comparten un cable troncal. Es económica para redes pequeñas, aunque el medio común puede saturarse.', tags: ['Económica', 'Simple', 'Colisión'], kicker: 'TOPOLOGÍA 03' }
};
const topologyVisual = document.querySelector('#topologyVisual');
document.querySelectorAll('.topology-tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.topology-tab').forEach((tab) => tab.classList.remove('active'));
    button.classList.add('active');
    const data = topologyContent[button.dataset.topology];
    document.querySelector('#topologyName').textContent = data.name;
    document.querySelector('#topologyDescription').textContent = data.description;
    document.querySelector('#topologyKicker').textContent = data.kicker;
    document.querySelector('#topologyTags').innerHTML = data.tags.map((tag) => `<span>${tag}</span>`).join('');
    topologyVisual.className = `topology-visual topology-${button.dataset.topology}`;
    topologyVisual.setAttribute('aria-label', `Diagrama de topología ${data.name.toLowerCase()}`);
  });
});

async function exportPdf() {
  exportButton.disabled = true;
  exportButton.innerHTML = '<span aria-hidden="true">…</span> Preparando';
  try {
    if (window.jspdf?.jsPDF && window.html2canvas) {
      const canvas = await window.html2canvas(document.querySelector('#content'), { scale: 1.4, backgroundColor: getComputedStyle(body).backgroundColor, useCORS: true });
      const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      let offset = 0;
      const image = canvas.toDataURL('image/jpeg', .88);
      while (offset < imageHeight) {
        if (offset > 0) pdf.addPage();
        pdf.addImage(image, 'JPEG', 0, -offset, imageWidth, imageHeight);
        offset += pageHeight;
      }
      pdf.save('nucleo-guia-sistemas.pdf');
      showToast('PDF exportado correctamente');
    } else {
      window.print();
    }
  } catch (error) {
    window.print();
  } finally {
    exportButton.disabled = false;
    exportButton.innerHTML = '<span aria-hidden="true">↓</span> Exportar PDF';
  }
}
exportButton.addEventListener('click', exportPdf);
