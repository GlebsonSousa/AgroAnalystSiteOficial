document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    //  ✔️ EMOJIS – movido para o ESCOPO GLOBAL
    // =====================================================================
    const emojis = { 
        "Soja (Safra)": "🌱", "Milho (Safra)": "🌽", "Milho (Safrinha)": "🌽", "Café Arábica": "☕", 
        "Cana-de-açúcar": "🎋", "Mandioca": "🥔", "Feijão (Safra)": "🫘", "Laranja": "🍊", "Algodão": "☁️", 
        "Arroz (Irrigado)": "🌾", "Trigo": "🌾", "Sorgo": "🌾", "Banana": "🍌", "Uva (Vitis Vinifera)": "🍇", 
        "Mamão": "🥭", "Abacaxi": "🍍", "Batata": "🥔", "Eucalipto": "🌳", "Pastagem (Brachiaria)": "🌿", 
        "Tomate (Indústria)": "🍅", "Cebola": "🧅", "Alho": "🧄", "Cenoura": "🥕", "Alface": "🥬", 
        "Seringueira (Borracha)": "🌳", "Manga": "🥭", "Maracujá": "🍈", "Limão": "🍋", "Abacate": "🥑", 
        "Açaí": "🌴", "Batata-Doce": "🍠", "Arroz (Sequeiro)": "🌾", "Amendoim": "🥜", "Girassol": "🌻", 
        "Café Conilon (Robusta)": "☕", "Cacau": "🫘", "Coco": "🥥", "Goiaba": "🍈", "Maçã": "🍎", 
        "Pêssego": "🍑", "Abóbora": "🎃", "Melancia": "🍉", "Pinus": "🌲", "Dendê (Palma)": "🌴", 
        "Fumo (Tabaco)": "🍃", "Pastagem (Panicum)": "🌿", "Alfafa": "🌿"
    };

    // =====================================================================
    // Seleção dos Elementos
    // =====================================================================
    const ctxChuva = document.getElementById('grafico-chuva')?.getContext('2d');
    const logo = document.getElementById('area-logo');
    const cadastrar = document.getElementById('cadastro');
    const login = document.getElementById('login') || document.getElementById('loginn'); 
    const botao = document.getElementById("botao-analisar-solo");
    const inputCidade = document.getElementById("input-cidade");

    const estadoSpan = document.getElementById("estado");
    const cidadeSpan = document.getElementById("cidade");
    const regiaoSpan = document.getElementById("regiao");
    const tipoSoloSpan = document.getElementById("tipo-solo");
    const climaSpan = document.getElementById("clima");
    const texturaSpan = document.getElementById("textura");
    const drenagemSpan = document.getElementById("drenagem");
    const phSpan = document.getElementById("ph");
    const fertilidadeSpan = document.getElementById("fertilidade");

    let mapa;
    let marcador;
    let coordenadasSelecionadas = null;
    let graficoChuva;

    // =====================================================================
    // Navegação
    // =====================================================================
    if (cadastrar) cadastrar.addEventListener('click', () => location.href = "/AgroAnalyst-VersaoFinal/src/paginas/cadastro_login/cadastro.html");
    if (login) login.addEventListener('click', () => location.href = "/AgroAnalyst-VersaoFinal/src/paginas/cadastro_login/login.html");
    if (logo) logo.addEventListener('click', () => location.href = "/AgroAnalyst-VersaoFinal/index.html");

    // =====================================================================
    // Gráfico de Chuva
    // =====================================================================
    if (ctxChuva) {
        graficoChuva = new Chart(ctxChuva, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                    label: 'Precipitação (mm)',
                    data: [120, 110, 95, 85, 70, 60, 55, 65, 80, 100, 115, 125],
                    backgroundColor: '#2f6c2f',
                    borderRadius: 10,
                }]
            }
        });
    }

    // =====================================================================
    // Mapa Interativo
    // =====================================================================
    function inicializarMapa() {
        if (!document.getElementById('mapa-interativo')) {
            console.error("Elemento 'mapa-interativo' não encontrado.");
            return;
        }
        
        mapa = L.map('mapa-interativo').setView([-14.235, -51.9253], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

        mapa.on('click', async function(e) {
            coordenadasSelecionadas = e.latlng;
            atualizarMapa(coordenadasSelecionadas.lat, coordenadasSelecionadas.lng);
            analisarSolo(); 
        });
    }
    inicializarMapa();

    // =====================================================================
    // CLICK DO BOTÃO PRINCIPAL
    // =====================================================================
    if (botao) {
        botao.addEventListener("click", () => {
            const cepInput = inputCidade.value.trim();
            const ehCepValido = /^\d{5}-?\d{3}$/.test(cepInput);

            if (ehCepValido) buscarPorCep(cepInput);
            else if (coordenadasSelecionadas) analisarSolo();
            else alert("Digite um CEP válido ou clique no mapa.");
        });
    }

    // =====================================================================
    // Buscar por CEP
    // =====================================================================
    async function buscarPorCep(cep) {
        const cepLimpo = cep.replace("-", "");

        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const dados = await resposta.json();

            if (dados.erro) {
                alert("CEP não encontrado.");
                return;
            }

            estadoSpan.textContent = obterEstadoPorExtenso(dados.uf);
            cidadeSpan.textContent = dados.localidade;
            regiaoSpan.textContent = obterRegiaoPorSigla(dados.uf);

            const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(dados.localidade)}+${encodeURIComponent(dados.uf)}&format=json&limit=1`;
            const geoRes = await fetch(geoUrl);
            const geoDados = await geoRes.json();

            if (geoDados.length > 0) {
                const lat = parseFloat(geoDados[0].lat);
                const lon = parseFloat(geoDados[0].lon);

                coordenadasSelecionadas = { lat, lng: lon };
                atualizarMapa(lat, lon);
                analisarSolo(true); 
            } else {
                analisarSolo(false);
            }
        } catch (erro) {
            console.error("Erro no CEP:", erro);
        }
    }

    // =====================================================================
    // Atualizar o mapa com marcador
    // =====================================================================
    function atualizarMapa(lat, lon) {
        if (marcador) mapa.removeLayer(marcador);
        mapa.setView([lat, lon], 12);
        marcador = L.marker([lat, lon]).addTo(mapa);
    }

    // =====================================================================
    // FUNÇÃO AUXILIAR: Buscar Temperatura Média Anual
    // =====================================================================
    async function buscarTemperaturaMediaAnual(lat, lon) {
        const start_date = "2023-01-01";
        const end_date = "2023-12-31";
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start_date}&end_date=${end_date}&daily=temperature_2m_mean&timezone=auto`;

        try {
            const resposta = await fetch(url);
            const dados = await resposta.json();

            if (!resposta.ok || dados.error) {
                console.warn("Erro ao buscar temperatura média anual:", dados.reason || "Erro desconhecido");
                return null;
            }

            const temperaturas = dados.daily.temperature_2m_mean;
            if (temperaturas && temperaturas.length > 0) {
                const soma = temperaturas.reduce((acc, temp) => acc + temp, 0);
                const media = soma / temperaturas.length;
                return media.toFixed(1);
            }
            return null;
        } catch (erro) {
            console.error("Erro na requisição da Open-Meteo:", erro);
            return null;
        }
    }

    // =====================================================================
    // FUNÇÃO PRINCIPAL DE ANÁLISE
    // =====================================================================
    async function analisarSolo(localizacaoAtualizada = false) { 
        if (!coordenadasSelecionadas) return;

        const lat = coordenadasSelecionadas.lat;
        const lng = coordenadasSelecionadas.lng;

        const spinner = document.getElementById('loading-spinner');
        const grafico = document.getElementById('grafico-chuva');
        const listaCulturasSimples = document.getElementById("lista-culturas");

        spinner.style.display = 'flex';
        grafico.style.display = 'none';
        listaCulturasSimples.innerHTML = "";

        try {
            const [respostaSolo, tempMediaAnual] = await Promise.all([
                fetch(`https://meteoserver-stfv.onrender.com/solo?lat=${lat}&lon=${lng}`),
                buscarTemperaturaMediaAnual(lat, lng)
            ]);

            const dados = await respostaSolo.json();
            console.log("🟢 Dados do solo recebidos:", dados);
            console.log("🟢 culturas_db existe?", dados.culturas_db ? "SIM ✅" : "NÃO ❌");
            console.log("🟢 Quantidade de culturas:", Object.keys(dados.culturas_db || {}).length);

            if (!respostaSolo.ok) throw new Error("Erro na API");

            dados.temperatura_media_anual = tempMediaAnual;

            // ⚠️ CORREÇÃO: Chama carregarAnaliseDetalhada ANTES de preencher culturas simples
            carregarAnaliseDetalhada(dados);

            // Atualiza localização se necessário
            if (!localizacaoAtualizada) {
                const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`;
                const geoRes = await fetch(geoUrl);
                const geoDados = await geoRes.json();

                if (geoDados.address) {
                    const address = geoDados.address;
                    const uf = address.state_code || address.state || ''; 
                    
                    regiaoSpan.textContent = obterRegiaoPorSigla(uf);
                    estadoSpan.textContent = obterEstadoPorExtenso(uf);
                    cidadeSpan.textContent = address.city || address.town || address.village || address.county || "Local Desconhecido";
                }
            }

            // SOLO
            tipoSoloSpan.textContent = dados.solo_local?.tipo_solo || "-";
            texturaSpan.textContent = dados.solo_local?.textura || "-";
            drenagemSpan.textContent = dados.solo_local?.drenagem || "-";
            fertilidadeSpan.textContent = dados.solo_local?.fertilidade || "-";
            phSpan.textContent = dados.solo_preciso?.ph_preciso || dados.solo_local?.ph || "-";

            // CHUVA / CLIMA
            if (dados.chuva?.soma_chuva_mensal) {
                const dadosOrdenados = dados.chuva.soma_chuva_mensal.sort((a,b)=>a.mes-b.mes);
                graficoChuva.data.labels = dadosOrdenados.map(m => m.nome_mes);
                graficoChuva.data.datasets[0].data = dadosOrdenados.map(m => m.soma_mm);
                graficoChuva.update();

                climaSpan.textContent = dados.chuva.solo?.clima || "-";
            }

            // CULTURAS SIMPLES (lista de ícones)
            if (dados.recomendacoes?.length > 0) {
                dados.recomendacoes.forEach(cultura => {
                    const li = document.createElement("li");
                    li.textContent = `${emojis[cultura.nome] || "✔️"} ${cultura.nome}`;
                    listaCulturasSimples.appendChild(li);
                });
            } else {
                listaCulturasSimples.innerHTML = "<li>Nenhuma cultura recomendada.</li>";
            }

        } catch (erro) {
            console.error("Erro análise:", erro);
            alert("Erro ao buscar dados. Verifique o console.");
        } finally {
            spinner.style.display = 'none';
            grafico.style.display = 'block';
        }
    }

    // =====================================================================
    // Função para preencher Análise Detalhada
    // =====================================================================
    function carregarAnaliseDetalhada(dados) {
        document.getElementById('loadingDetalhes').style.display = 'none';

        const infoSoloGrid = document.getElementById('infoSoloGrid');
        infoSoloGrid.style.display = "grid";

        const climaPredominante = dados.chuva?.solo?.clima || "-";
        const precipitacaoAnual = dados.chuva?.chuva_total_anual_mm ? dados.chuva.chuva_total_anual_mm.toFixed(0) : "-";
        const temperaturaMediaAnual = dados.temperatura_media_anual || "-";

        infoSoloGrid.innerHTML = `
            <div class="card-info">
                <h3><span class="icone">🧪</span> pH do Solo</h3>
                <div class="valor">${dados.solo_preciso?.ph_preciso || dados.solo_local.ph}</div>
                <div class="descricao">Análise precisa via satélite (ISRIC)</div>
            </div>

            <div class="card-info">
                <h3><span class="icone">🌱</span> Matéria Orgânica</h3>
                <div class="valor">${dados.solo_preciso?.materia_organica_percent || "-"}%</div>
                <div class="descricao">Indicador de fertilidade e retenção</div>
            </div>

            <div class="card-info">
                <h3><span class="icone">🏔️</span> Teor de Argila</h3>
                <div class="valor">${dados.solo_preciso?.argila_percent || "-"}%</div>
                <div class="descricao">Define retenção hídrica e textura</div>
            </div>

            <div class="card-info">
                <h3><span class="icone">💧</span> Drenagem</h3>
                <div class="valor">${dados.solo_local.drenagem}</div>
                <div class="descricao">Classificação da capacidade de drenagem</div>
            </div>

            <div class="card-info">
                <h3><span class="icone">☀️</span> Clima Predominante</h3>
                <div class="valor">${climaPredominante}</div>
                <div class="descricao">Classificação climática da região</div>
            </div>

            <div class="card-info">
                <h3><span class="icone">🌍</span> Tipo de Solo</h3>
                <div class="valor">${dados.solo_local.tipo_solo}</div>
                <div class="descricao">Classificação principal do solo</div>
            </div>

            <div class="card-info">
                <h3><span class="icone">🌡️</span> Temperatura Média Anual</h3>
                <div class="valor">${temperaturaMediaAnual}°C</div>
                <div class="descricao">Média de temperatura na região</div>
            </div>

            <div class="card-info">
                <h3><span class="icone">🌧️</span> Precipitação Anual</h3>
                <div class="valor">${precipitacaoAnual}mm</div>
                <div class="descricao">Volume total de chuva por ano</div>
            </div>
        `;

        // 🟢 CARDS DETALHADOS DE CULTURAS
        const culturasRecomendadasDiv = document.getElementById('culturasRecomendadas');
        const listaCulturasDetalhada = document.getElementById('lista-culturas-detalhada');
        
        culturasRecomendadasDiv.style.display = "block";
        listaCulturasDetalhada.innerHTML = "";

        if (dados.recomendacoes?.length > 0) {
            // ✅ CORREÇÃO: Busca culturas_db no lugar correto (dentro de chuva)
            const culturasDB = dados.culturas_db || dados.chuva?.culturas_db || {};

            dados.recomendacoes.forEach(cultura => {
                const emoji = emojis[cultura.nome] || "✔️";
                const culturaInfo = culturasDB[cultura.nome] || {};
                
                const descricao = culturaInfo.descricao || "Descrição não disponível.";
                const requisitos = culturaInfo.requisitos || [];

                const cardCultura = document.createElement('div');
                cardCultura.className = 'card-cultura';

                cardCultura.innerHTML = `
                    <div class="score-badge">Score: ${cultura.score}/7</div>

                    <div class="card-cultura-header">
                        <div class="card-cultura-emoji">${emoji}</div>
                        <div class="card-cultura-info">
                            <h3>${cultura.nome}</h3>
                            <span class="categoria-badge">${cultura.categoria}</span>
                        </div>
                    </div>

                    <div class="card-cultura-detalhes">
                        <p style="margin-bottom: 15px; color: #515150; line-height: 1.6;">
                            ${descricao}
                        </p>

                        ${requisitos.map(req => `
                            <div class="detalhe-item">
                                <span class="icone-check">✓</span>
                                <span>${req}</span>
                            </div>
                        `).join('')}
                    </div>
                `;

                listaCulturasDetalhada.appendChild(cardCultura);
            });
        } else {
            listaCulturasDetalhada.innerHTML = "<p style='padding: 20px;'>Nenhuma cultura recomendada encontrada para esta região.</p>";
        }

        // Método de Busca
        const metodoBuscaDiv = document.getElementById('metodoBusca');
        const metodoTextoSpan = document.getElementById('metodoTexto');
        metodoBuscaDiv.style.display = "block";
        metodoTextoSpan.textContent = dados.metodo_busca || "Busca por Coordenadas";
    }

    // =====================================================================
    // Funções Auxiliares de Localização
    // =====================================================================
    function obterEstadoPorExtenso(sigla) {
        const estados = {
            'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
            'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
            'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
            'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
            'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
            'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
            'SE': 'Sergipe', 'TO': 'Tocantins'
        };
        return estados[sigla.toUpperCase()] || sigla;
    }

    function obterRegiaoPorSigla(sigla) {
        const regioes = {
            'AC': 'Norte', 'AM': 'Norte', 'AP': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
            'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
            'DF': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste',
            'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
            'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul'
        };
        return regioes[sigla.toUpperCase()] || 'Região Desconhecida';
    }

});