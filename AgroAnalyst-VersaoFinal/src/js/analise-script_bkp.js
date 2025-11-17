document.addEventListener('DOMContentLoaded', () => {
  const ctxChuva = document.getElementById('grafico-chuva')?.getContext('2d');
  const logo = document.getElementById('area-logo');
  const cadastrar = document.getElementById('cadastro');
  const login = document.getElementById('login');
  const botao = document.getElementById("botao-analisar-solo");

  if (cadastrar) {
    cadastrar.addEventListener('click', () => {
      location.href = "/AgroAnalyst-VersaoFinal/src/paginas/cadastro_login/cadastro.html";
      console.log('Cadastro clicado');
    });
  }

  if (login) {
    login.addEventListener('click', () => {
      location.href = "/AgroAnalyst-VersaoFinal/src/paginas/cadastro_login/login.html";
      console.log('Login clicado');
    });
  }

  if (logo) {
    logo.addEventListener('click', () => {
      location.href = "/AgroAnalyst-VersaoFinal/index.html";
    });
  }

  if (botao) {
    botao.addEventListener("click", buscarPorCep);
  }

  if (ctxChuva) {
    new Chart(ctxChuva, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [{
          label: 'Precipitação (mm)',
          data: [120, 110, 95, 85, 70, 60, 55, 65, 80, 100, 115, 125],
          backgroundColor: '#2f6c2f',
          borderRadius: 10,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#333',
              font: { size: 14 }
            }
          },
          tooltip: {
            callbacks: {
              label: context => `${context.parsed.y} mm`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Milímetros (mm)',
              color: '#333',
              font: { size: 14 }
            },
            ticks: { color: '#333' }
          },
          x: { ticks: { color: '#333' } }
        }
      }
    });
  }


  async function buscaDados(){
    try {
      const resposta = await fetch('https://meteoserver-h0u8.onrender.com/');
      const data = await resposta.json();

      if (data.erro) {
        alert("servidor nao encontrado.");
        return;
      }else{
        console.log(data)
      }
    }catch (erro) {
      alert("Erro ao buscar o servidor. Tente novamente.");
      console.error(erro);
    }
  }

  async function buscarPorCep() {
    const cepInput = document.getElementById("input-cidade").value.trim();
    const estadoSpan = document.getElementById("estado");
    const cidadeSpan = document.getElementById("cidade");
    const regiaoSpan = document.getElementById("regiao");

    const ehCepValido = /^\d{5}-?\d{3}$/.test(cepInput);
    if (!ehCepValido) {
      alert("Digite um CEP válido no formato 00000-000 ou 00000000.");
      return;
    }
    //---------------------------
  
    buscaDados()

    //---------------------------

    const cepLimpo = cepInput.replace("-", "");

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await resposta.json();

      if (dados.erro) {
        alert("CEP não encontrado.");
        return;
      }

      const siglaUf = dados.uf;
      const nomeEstado = obterEstadoPorExtenso(siglaUf);
      const regiao = obterRegiaoPorSigla(siglaUf);

      estadoSpan.textContent = nomeEstado;
      cidadeSpan.textContent = dados.localidade;
      regiaoSpan.textContent = regiao;

      console.log(`Estado: ${nomeEstado}, Região: ${regiao}`);
    } catch (erro) {
      alert("Erro ao buscar o CEP. Tente novamente.");
      console.error(erro);
    }
  }

  function obterEstadoPorExtenso(uf) {
    const estados = {
      AC: "Acre",
      AL: "Alagoas",
      AP: "Amapá",
      AM: "Amazonas",
      BA: "Bahia",
      CE: "Ceará",
      DF: "Distrito Federal",
      ES: "Espírito Santo",
      GO: "Goiás",
      MA: "Maranhão",
      MT: "Mato Grosso",
      MS: "Mato Grosso do Sul",
      MG: "Minas Gerais",
      PA: "Pará",
      PB: "Paraíba",
      PR: "Paraná",
      PE: "Pernambuco",
      PI: "Piauí",
      RJ: "Rio de Janeiro",
      RN: "Rio Grande do Norte",
      RS: "Rio Grande do Sul",
      RO: "Rondônia",
      RR: "Roraima",
      SC: "Santa Catarina",
      SP: "São Paulo",
      SE: "Sergipe",
      TO: "Tocantins"
    };

    return estados[uf] || "Estado desconhecido";
  }

  function obterRegiaoPorSigla(uf) {
    const regioes = {
      Norte: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
      Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
      CentroOeste: ["DF", "GO", "MT", "MS"],
      Sudeste: ["ES", "MG", "RJ", "SP"],
      Sul: ["PR", "RS", "SC"]
    };

    for (const [regiao, siglas] of Object.entries(regioes)) {
      if (siglas.includes(uf)) return regiao;
    }

    return "Região desconhecida";
  }

});
