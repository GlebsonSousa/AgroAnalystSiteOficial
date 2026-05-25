/* ============================================
   AGROANALYST — JavaScript
   ============================================ */

// ============================================
// NAVEGAÇÃO
// ============================================
const itensMenu = document.querySelectorAll('.menu-item[data-pagina]');
const paginas = document.querySelectorAll('.pagina');
itensMenu.forEach(item => {
  item.addEventListener('click', () => {
    const alvo = item.dataset.pagina;
    itensMenu.forEach(i => i.classList.remove('ativo'));
    item.classList.add('ativo');
    paginas.forEach(p => p.classList.remove('ativa'));
    document.getElementById('pagina-' + alvo).classList.add('ativa');
  });
});

// ============================================
// CONFIG GLOBAL CHART.JS
// ============================================
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#7F8C8D';
Chart.defaults.plugins.legend.display = false;
Chart.defaults.maintainAspectRatio = false; // Garante que tudo caiba na div pai

const CORES = {
  primaria: '#2E7D32',
  secundaria: '#1565C0',
  alerta: '#EF6C00',
  erro: '#C62828',
  muted: '#7F8C8D',
  titulo: '#2C3E50'
};

// ============================================
// DONUTS (canvas customizado)
// ============================================
function desenharDonut(canvas, valor) {
  const v = valor !== undefined ? valor : parseInt(canvas.dataset.valor, 10);
  const cor = canvas.dataset.cor || '#2E7D32';
  const tamCss = canvas.classList.contains('donut-grande') ? 130 : 90;
  canvas.width = tamCss * 2;
  canvas.height = tamCss * 2;
  canvas.style.width = tamCss + 'px';
  canvas.style.height = tamCss + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(2, 2);
  ctx.clearRect(0, 0, tamCss, tamCss);
  const cx = tamCss / 2, cy = tamCss / 2;
  const raio = tamCss / 2 - 10;
  const espessura = canvas.classList.contains('donut-grande') ? 12 : 8;
  ctx.beginPath();
  ctx.arc(cx, cy, raio, 0, Math.PI * 2);
  ctx.strokeStyle = '#EEF1ED';
  ctx.lineWidth = espessura;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, raio, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * v / 100));
  ctx.strokeStyle = cor;
  ctx.lineWidth = espessura;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.fillStyle = CORES.titulo;
  ctx.font = `bold ${canvas.classList.contains('donut-grande') ? 22 : 14}px Inter`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(v + '%', cx, cy);
}
// Inicia donuts estáticos (com data-valor)
document.querySelectorAll('.donut[data-valor]').forEach(c => desenharDonut(c));

// ============================================
// PÁGINA 1: FROTA — gestão de veículos
// ============================================
let veiculos = [
  { id: 1, placa: 'MTX-1A23', modelo: 'John Deere 6110J', tipo: 'Trator', ano: 2021, horas: 4520, status: 'Operação', manutencao: '2024-04-12' },
  { id: 2, placa: 'AGR-2B45', modelo: 'New Holland TL95', tipo: 'Trator', ano: 2019, horas: 8230, status: 'Manutenção', manutencao: '2024-05-08' },
  { id: 3, placa: 'CLH-9F12', modelo: 'Case IH 7240', tipo: 'Colheitadeira', ano: 2022, horas: 2150, status: 'Operação', manutencao: '2024-03-20' },
  { id: 4, placa: 'CLH-4D67', modelo: 'Massey Ferguson 9790', tipo: 'Colheitadeira', ano: 2020, horas: 3870, status: 'Parado', manutencao: '2024-02-15' },
  { id: 5, placa: 'CAM-7K89', modelo: 'Volvo FH 540', tipo: 'Caminhão', ano: 2023, horas: 38000, status: 'Operação', manutencao: '2024-05-01' },
  { id: 6, placa: 'CAM-3J21', modelo: 'Scania R450', tipo: 'Caminhão', ano: 2018, horas: 142000, status: 'Manutenção', manutencao: '2024-04-28' }
];

const corpoTabela = document.getElementById('tabela-veiculos');
const filtroStatus = document.getElementById('filtro-frota-status');

function classeStatus(s) {
  if (s === 'Operação') return 'operacao';
  if (s === 'Manutenção') return 'manutencao';
  return 'parado';
}

function renderizarTabela() {
  const filtro = filtroStatus.value;
  const lista = filtro ? veiculos.filter(v => v.status === filtro) : veiculos;
  corpoTabela.innerHTML = lista.map(v => `
    <tr>
      <td><strong>${v.placa}</strong></td>
      <td>${v.modelo}</td>
      <td>${v.tipo}</td>
      <td>${v.ano}</td>
      <td>${v.horas.toLocaleString('pt-BR')}</td>
      <td><span class="status-pill ${classeStatus(v.status)}">${v.status}</span></td>
      <td>${new Date(v.manutencao).toLocaleDateString('pt-BR')}</td>
      <td><button class="btn-remover" data-id="${v.id}" title="Remover">🗑</button></td>
    </tr>
  `).join('');
  corpoTabela.querySelectorAll('.btn-remover').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      veiculos = veiculos.filter(v => v.id !== id);
      atualizarFrota();
    });
  });
}

function atualizarKPIsFrota() {
  const total = veiculos.length || 1;
  const operacao = veiculos.filter(v => v.status === 'Operação').length;
  const pctOp = Math.round((operacao / total) * 100);
  const pctMan = Math.round((veiculos.filter(v => v.status !== 'Manutenção').length / total) * 100);

  document.getElementById('kpi-operacao').textContent = pctOp + '%';
  document.getElementById('kpi-manutencao').textContent = pctMan + '%';
  desenharDonut(document.getElementById('donut-operacao'), pctOp);
  desenharDonut(document.getElementById('donut-manutencao'), pctMan);

  document.getElementById('cat-tratores').textContent = veiculos.filter(v => v.tipo === 'Trator').length;
  document.getElementById('cat-colheitadeiras').textContent = veiculos.filter(v => v.tipo === 'Colheitadeira').length;
  document.getElementById('cat-caminhoes').textContent = veiculos.filter(v => v.tipo === 'Caminhão').length;
}

function atualizarFrota() {
  renderizarTabela();
  atualizarKPIsFrota();
}

filtroStatus.addEventListener('change', renderizarTabela);

// Modal adicionar veículo
const modalVeiculo = document.getElementById('modal-veiculo');
document.getElementById('abrir-modal-veiculo').addEventListener('click', () => modalVeiculo.classList.add('aberto'));
document.getElementById('fechar-modal').addEventListener('click', () => modalVeiculo.classList.remove('aberto'));
document.getElementById('cancelar-modal').addEventListener('click', () => modalVeiculo.classList.remove('aberto'));
modalVeiculo.addEventListener('click', e => { if (e.target === modalVeiculo) modalVeiculo.classList.remove('aberto'); });

document.getElementById('form-veiculo').addEventListener('submit', e => {
  e.preventDefault();
  const dados = Object.fromEntries(new FormData(e.target).entries());
  veiculos.push({
    id: Date.now(),
    placa: dados.placa.toUpperCase(),
    modelo: dados.modelo,
    tipo: dados.tipo,
    ano: parseInt(dados.ano, 10),
    horas: parseInt(dados.horas, 10),
    status: dados.status,
    manutencao: dados.manutencao
  });
  e.target.reset();
  modalVeiculo.classList.remove('aberto');
  atualizarFrota();
});

atualizarFrota();

// Gráficos frota
new Chart(document.getElementById('grafico-horas-frota'), {
  type: 'bar',
  data: {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    datasets: [{
      data: [8, 10, 7, 12, 9, 5],
      backgroundColor: ['#2E7D32','#2E7D32','#7F8C8D','#2E7D32','#2E7D32','#7F8C8D'],
      borderRadius: 6
    }]
  },
  options: { scales: { y: { beginAtZero: true, grid: { color: '#F0F2F0' } }, x: { grid: { display: false } } } }
});

new Chart(document.getElementById('grafico-gasto-logistico'), {
  type: 'line',
  data: {
    labels: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
    datasets: [{
      data: [180, 300, 250, 600, 350, 400, 280],
      borderColor: CORES.primaria,
      backgroundColor: 'rgba(46,125,50,0.1)',
      fill: true, tension: 0.4,
      pointBackgroundColor: CORES.primaria, pointRadius: 5
    }]
  }
});

// ============================================
// PÁGINA 2: ANÁLISE DE IMAGENS
// ============================================
const deteccoes = [
  { icone: '🌱', titulo: 'Baixo vigor', talhao: 'Talhão 01 · 1,2 ac', tag: 'baixa', cor: 'Baixa' },
  { icone: '💧', titulo: 'Problema de solo', talhao: 'Talhão 03 · 4,5 ac', tag: 'alta', cor: 'Alta' },
  { icone: '💧', titulo: 'Problema de solo', talhao: 'Talhão 04 · 2,1 ac', tag: 'media', cor: 'Média' },
  { icone: '🌾', titulo: 'Plantio falho', talhao: 'Talhão 05 · 0,8 ac', tag: 'baixa', cor: 'Baixa' },
  { icone: '🐛', titulo: 'Erva daninha', talhao: 'Talhão 07 · 3,2 ac', tag: 'media', cor: 'Média' },
  { icone: '🐛', titulo: 'Erva daninha', talhao: 'Talhão 09 · 1,5 ac', tag: 'baixa', cor: 'Baixa' },
  { icone: '🔥', titulo: 'Estresse hídrico', talhao: 'Talhão 12 · 5,0 ac', tag: 'alta', cor: 'Alta' },
  { icone: '🐜', titulo: 'Pragas detectadas', talhao: 'Talhão 14 · 2,8 ac', tag: 'media', cor: 'Média' }
];
const listaDeteccoesEl = document.getElementById('lista-deteccoes');
if (listaDeteccoesEl) {
    listaDeteccoesEl.innerHTML = deteccoes.map(d => `
      <li class="deteccao-item">
        <div class="deteccao-icone">${d.icone}</div>
        <div class="deteccao-info">
          <strong>${d.titulo}</strong>
          <small>${d.talhao}</small>
        </div>
        <span class="deteccao-tag ${d.tag}">${d.cor}</span>
      </li>
    `).join('');
}

new Chart(document.getElementById('grafico-anomalias'), {
  type: 'bar',
  data: {
    labels: ['Falha Sulco','Invasoras','Estresse','Pragas'],
    datasets: [{ data: [12, 25, 8, 15], backgroundColor: [CORES.alerta, CORES.primaria, CORES.secundaria, CORES.erro], borderRadius: 6 }]
  },
  options: { scales: { y: { beginAtZero: true } } }
});

new Chart(document.getElementById('grafico-quebra-safra'), {
  type: 'line',
  data: {
    labels: ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6'],
    datasets: [{
      data: [2, 5, 8, 6, 10, 7],
      borderColor: CORES.alerta,
      backgroundColor: 'rgba(239,108,0,0.1)',
      fill: true, tension: 0.4,
      pointBackgroundColor: CORES.alerta, pointRadius: 5
    }]
  }
});

// ============================================
// PÁGINA 3: GRÃOS
// ============================================
new Chart(document.getElementById('grafico-graos-semana'), {
  type: 'bar',
  data: {
    labels: ['Seg','Ter','Qua','Qui','Sex'],
    datasets: [{ data: [140, 141.5, 142, 141.8, 142.8], backgroundColor: CORES.primaria, borderRadius: 6 }]
  }
});

const dadosGraos = {
  soja: [135, 138, 140, 142, 141, 143, 142.8],
  milho: [70, 69, 68, 68.5, 67, 68, 68.4],
  cafe: [1180, 1200, 1220, 1230, 1240, 1245, 1250]
};
let graficoGraosHist = new Chart(document.getElementById('grafico-graos-historico'), {
  type: 'line',
  data: {
    labels: ['1','5','10','15','20','25','30'],
    datasets: [{
      label: 'Soja',
      data: dadosGraos.soja,
      borderColor: CORES.primaria,
      backgroundColor: 'rgba(46,125,50,0.1)',
      fill: true, tension: 0.4
    }]
  }
});
document.getElementById('seletor-grao').addEventListener('change', e => {
  const grao = e.target.value;
  graficoGraosHist.data.datasets[0].data = dadosGraos[grao];
  graficoGraosHist.data.datasets[0].label = grao.toUpperCase();
  graficoGraosHist.update();
});

// ============================================
// PÁGINA 4: FINANCEIRO
// ============================================
const meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

new Chart(document.getElementById('grafico-receita-despesa'), {
  type: 'bar',
  data: {
    labels: meses,
    datasets: [
      { label: 'Receita', data: [5000,4500,4800,4700,4200,4900,4600,5000,4300,4800,4200,4700], backgroundColor: CORES.primaria, borderRadius: 4, order: 2 },
      { label: 'Despesa', data: [-3200,-3000,-3400,-3100,-3500,-2900,-3300,-3800,-3200,-3400,-3000,-3500], backgroundColor: CORES.erro, borderRadius: 4, order: 2 },
      { label: 'Lucro', type: 'line', data: [1000,500,800,900,400,700,300,200,600,800,700,900], borderColor: CORES.titulo, backgroundColor: CORES.titulo, tension: 0.4, pointRadius: 3, order: 1 }
    ]
  },
  options: { scales: { y: { grid: { color: '#F0F2F0' } } } }
});

new Chart(document.getElementById('grafico-saldo-mes'), {
  type: 'line',
  data: {
    labels: meses,
    datasets: [{
      data: [4100, 3500, 2100, 3700, 3700, 4300, 5500, 6000, 5700, 7300, 7400, 7684],
      borderColor: '#F2C94C',
      backgroundColor: 'rgba(242,201,76,0.15)',
      fill: true, tension: 0.4,
      pointBackgroundColor: '#F2C94C', pointRadius: 4
    }]
  }
});

let graficoDinamico;
const labelsDin = ['Combustível','Insumos','Mão de Obra','Manutenção','Vendas Soja','Vendas Milho'];
const dadosDinamicos = {
  mes:        [1200, 900, 700, 300, 2500, 1300],
  trimestre:  [3500, 2700, 2100, 900, 7400, 3900],
  ano:        [12800, 9600, 7200, 3200, 28500, 14200]
};
const coresDin = [CORES.alerta, CORES.secundaria, CORES.primaria, CORES.muted, '#4CAF50', '#81C784'];

function montarGraficoDinamico(tipo, periodo) {
  if (graficoDinamico) graficoDinamico.destroy();
  const valores = dadosDinamicos[periodo] || dadosDinamicos.ano;
  graficoDinamico = new Chart(document.getElementById('grafico-dinamico-fin'), {
    type: tipo,
    data: {
      labels: labelsDin,
      datasets: [{
        label: 'Valor (R$)',
        data: valores,
        backgroundColor: coresDin,
        borderColor: tipo === 'line' ? CORES.primaria : coresDin,
        borderWidth: 2,
        fill: tipo === 'line',
        tension: 0.4
      }]
    },
    options: {
      plugins: { legend: { display: tipo === 'pie' || tipo === 'doughnut', position: 'right' } }
    }
  });
}
montarGraficoDinamico('bar', 'ano');

document.getElementById('filtro-tipo-grafico').addEventListener('change', e => {
  montarGraficoDinamico(e.target.value, document.getElementById('filtro-periodo-fin').value);
});
document.getElementById('filtro-periodo-fin').addEventListener('change', e => {
  montarGraficoDinamico(document.getElementById('filtro-tipo-grafico').value, e.target.value);
});

new Chart(document.getElementById('grafico-projecao-fin'), {
  type: 'line',
  data: {
    labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago'],
    datasets: [
      { label: 'Receita Projetada', data: [100,140,180,220,280,350,420,500], borderColor: CORES.primaria, backgroundColor: 'rgba(46,125,50,0.1)', fill: true, tension: 0.4 },
      { label: 'Custo Acumulado',   data: [80,130,170,210,250,290,320,360],  borderColor: CORES.erro,     backgroundColor: 'rgba(198,40,40,0.05)', fill: true, tension: 0.4, borderDash: [5,5] }
    ]
  },
  options: { plugins: { legend: { display: true, position: 'bottom' } } }
});

// ============================================
// CALENDÁRIOS
// ============================================
function montarCalendario(elementoId, diasMarcados = []) {
  const el = document.getElementById(elementoId);
  if (!el) return;
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const diaHoje = hoje.getDate();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const nomesMes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  let html = `
    <div class="calendario-cabecalho">
      <h4>${nomesMes[mes]} ${ano}</h4>
      <div style="display:flex;gap:4px"><button>‹</button><button>›</button></div>
    </div>
    <div class="calendario-grade">
      <div class="dia-cabecalho">D</div><div class="dia-cabecalho">S</div>
      <div class="dia-cabecalho">T</div><div class="dia-cabecalho">Q</div>
      <div class="dia-cabecalho">Q</div><div class="dia-cabecalho">S</div>
      <div class="dia-cabecalho">S</div>
  `;
  for (let i = 0; i < primeiroDia; i++) html += '<div></div>';
  for (let d = 1; d <= totalDias; d++) {
    let classes = 'dia';
    if (diasMarcados.includes(d)) classes += ' marcado';
    if (d === diaHoje) classes += ' hoje';
    html += `<div class="${classes}">${d}</div>`;
  }
  html += '</div>';
  el.innerHTML = html;
}
montarCalendario('calendario-frota', [5, 12, 18, 25]);
montarCalendario('calendario-imagens', [3, 10, 17, 24]);
montarCalendario('calendario-graos', [7, 14, 21, 28]);
montarCalendario('calendario-financeiro', [5, 15, 28]);

// ============================================
// UPLOAD (drag & drop)
// ============================================
const areaUpload = document.getElementById('area-upload');
if (areaUpload) {
  ['dragenter','dragover'].forEach(evt => {
    areaUpload.addEventListener(evt, e => { e.preventDefault(); areaUpload.classList.add('arrastando'); });
  });
  ['dragleave','drop'].forEach(evt => {
    areaUpload.addEventListener(evt, e => { e.preventDefault(); areaUpload.classList.remove('arrastando'); });
  });
  areaUpload.addEventListener('drop', e => {
    alert(`${e.dataTransfer.files.length} arquivo(s) recebido(s) para análise.`);
  });
  areaUpload.querySelector('.botao-primario').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file'; input.multiple = true; input.accept = 'image/*';
    input.onchange = e => alert(`${e.target.files.length} arquivo(s) selecionado(s).`);
    input.click();
  });
}
