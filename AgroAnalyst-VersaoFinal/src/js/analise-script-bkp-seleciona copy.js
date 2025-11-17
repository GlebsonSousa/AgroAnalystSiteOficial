document.addEventListener('DOMContentLoaded', () => {
    // --- Seleção dos Elementos ---
    const ctxChuva = document.getElementById('grafico-chuva')?.getContext('2d');
    const logo = document.getElementById('area-logo');
    const cadastrar = document.getElementById('cadastro');
    const login = document.getElementById('login');
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

    let desenhando = false;
    let mapa;
    let marcador;
    let coordenadasSelecionadas = null;
    let graficoChuva;

    // --- Navegação ---
    if (cadastrar) cadastrar.addEventListener('click', () => location.href = "/AgroAnalyst-VersaoFinal/src/paginas/cadastro_login/cadastro.html");
    if (login) login.addEventListener('click', () => location.href = "/AgroAnalyst-VersaoFinal/src/paginas/cadastro_login/login.html");
    if (logo) logo.addEventListener('click', () => location.href = "/AgroAnalyst-VersaoFinal/index.html");

    // --- Gráfico de chuva ---
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
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { color: '#333', font: { size: 14 } } },
                    tooltip: { callbacks: { label: context => `${context.parsed.y} mm` } }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Milímetros (mm)', color: '#333', font: { size: 14 } }, ticks: { color: '#333' } },
                    x: { ticks: { color: '#333' } }
                }
            }
        });
    }

    // --- Inicialização do mapa ---
    function inicializarMapa() {
        mapa = L.map('mapa-interativo').setView([-14.235, -51.9253], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapa);

        mapa.on('click', async function(e) {
            if (desenhando) return;
            coordenadasSelecionadas = e.latlng;
            atualizarMapa(coordenadasSelecionadas.lat, coordenadasSelecionadas.lng);
        });
    }

    inicializarMapa();

    // --- 🟩 Ferramenta de desenho do terreno ---
    const drawnItems = new L.FeatureGroup();
    mapa.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true,
                shapeOptions: {
                    color: '#0D7A25',
                    fillColor: '#7CFC00',
                    fillOpacity: 0.3,
                    weight: 2
                }
            },
            rectangle: {
                shapeOptions: {
                    color: '#0D7A25',
                    fillColor: '#7CFC00',
                    fillOpacity: 0.3,
                    weight: 2
                }
            },
            polyline: false,
            circle: false,
            marker: false,
            circlemarker: false
        }
    });
    mapa.addControl(drawControl);

    const vertexStyle = {
        radius: 5,
        fillColor: '#006400',
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
    };

    mapa.on(L.Draw.Event.DRAWSTART, () => {
        desenhando = true;
    });

    mapa.on(L.Draw.Event.CREATED, (e) => {
        desenhando = false;
        drawnItems.clearLayers();

        const layer = e.layer;
        drawnItems.addLayer(layer);

        layer.setStyle({
            color: '#0D7A25',
            fillColor: '#7CFC00',
            fillOpacity: 0.3,
            weight: 2
        });

        // Adiciona marcadores nos vértices
        const coords = layer.getLatLngs()[0];
        coords.forEach(latlng => L.circleMarker(latlng, vertexStyle).addTo(drawnItems));

        // Calcula a área
        const polygon = turf.polygon([coords.map(p => [p.lng, p.lat])]);
        const area = turf.area(polygon);
        const areaHa = area / 10000;

        const centro = layer.getBounds().getCenter();
        L.popup()
            .setLatLng(centro)
            .setContent(`<b>Área:</b> ${area.toFixed(2)} m²<br>(${areaHa.toFixed(2)} ha)`)
            .openOn(mapa);

        window.terrenoDesenhado = {
            area_m2: area,
            coordenadas: coords.map(p => [p.lng, p.lat])
        };

        // ✅ Desativa modo de desenho ao soltar o mouse
        if (mapa.drawControl._toolbars.draw._modes.polygon.handler.enabled()) {
            mapa.drawControl._toolbars.draw._modes.polygon.handler.disable();
        }
        if (mapa.drawControl._toolbars.draw._modes.rectangle.handler.enabled()) {
            mapa.drawControl._toolbars.draw._modes.rectangle.handler.disable();
        }

        // Atualiza e analisa automaticamente
        coordenadasSelecionadas = centro;
        atualizarMapa(centro.lat, centro.lng);
        analisarSolo();
    });

    mapa.on(L.Draw.Event.DRAWSTOP, () => {
        desenhando = false;
    });

    // 🧹 Botão limpar terreno
    const limparBtn = L.control({ position: 'topright' });
    limparBtn.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = '<button title="Limpar terreno" style="background:#fff;border:none;padding:5px 8px;cursor:pointer;">🧹</button>';
        div.onclick = function () {
            drawnItems.clearLayers();
            delete window.terrenoDesenhado;
            mapa.closePopup();
        };
        return div;
    };
    limparBtn.addTo(mapa);

    // --- Botão principal ---
    if (botao) {
        botao.addEventListener("click", () => {
            const cepInput = inputCidade.value.trim();
            const ehCepValido = /^\d{5}-?\d{3}$/.test(cepInput);

            if (ehCepValido) {
                buscarPorCep(cepInput);
            } else if (coordenadasSelecionadas) {
                analisarSolo();
            } else {
                alert("Por favor, digite um CEP válido ou clique no mapa.");
            }
        });
    }

    // --- Funções auxiliares ---
    async function buscarPorCep(cep) {
        const cepLimpo = cep.replace("-", "");
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

            const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(dados.localidade)}+${encodeURIComponent(dados.uf)}&format=json&limit=1`;
            const geoResposta = await fetch(geocodingUrl);
            const geoDados = await geoResposta.json();
            
            console.log('Geo:',geoDados)


            if (geoDados.length > 0) {
                const lat = geoDados[0].lat;
                const lon = geoDados[0].lon;
                coordenadasSelecionadas = { lat: parseFloat(lat), lng: parseFloat(lon) };
                atualizarMapa(lat, lon);
                analisarSolo();
            } else {
                alert("Não foi possível encontrar coordenadas para este CEP.");
            }
        } catch (erro) {
            alert("Erro ao buscar o CEP. Tente novamente.");
            console.error(erro);
        }
    }

    function atualizarMapa(lat, lon) {
        if (desenhando) return;
        if (marcador) mapa.removeLayer(marcador);
        mapa.setView([lat, lon], 12);
        marcador = L.marker([lat, lon]).addTo(mapa);
    }

    async function analisarSolo() {
        if (!coordenadasSelecionadas) {
            alert("Localização não selecionada.");
            return;
        }

        const lat = coordenadasSelecionadas.lat;
        const lng = coordenadasSelecionadas.lng;
        const spinner = document.getElementById('loading-spinner');
        const grafico = document.getElementById('grafico-chuva');
        spinner.style.display = 'flex';
        grafico.style.display = 'none';

        try {
            const url = `https://meteoserver-stfv.onrender.com/chuva?lat=${lat}&lon=${lng}`;
            const resposta = await fetch(url);
            const dados = await resposta.json();

            if (resposta.ok) {
                if (dados.solo) {
                    tipoSoloSpan.textContent = dados.solo.tipo_solo;
                    climaSpan.textContent = dados.solo.clima_predominante;
                    texturaSpan.textContent = dados.solo.caracteristicas_solo.textura;
                    drenagemSpan.textContent = dados.solo.caracteristicas_solo.drenagem;
                    phSpan.textContent = dados.solo.caracteristicas_solo.pH;
                    fertilidadeSpan.textContent = dados.solo.caracteristicas_solo.fertilidade;
                }

                const dadosChuva = dados.soma_chuva_mensal.sort((a,b)=>a.mes-b.mes).map(m=>m.soma_mm);
                const labelsChuva = dados.soma_chuva_mensal.sort((a,b)=>a.mes-b.mes).map(m=>m.nome_mes);

                graficoChuva.data.labels = labelsChuva;
                graficoChuva.data.datasets[0].data = dadosChuva;
                graficoChuva.update();
            }
        } catch (error) {
            console.error("Erro ao conectar com o servidor:", error);
        } finally {
            spinner.style.display = 'none';
            grafico.style.display = 'block';
        }
    }

    function obterEstadoPorExtenso(uf) {
        const estados = {
            AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal",
            ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
            PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
            RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins"
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
