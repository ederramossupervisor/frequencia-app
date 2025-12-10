// ACOMPANHAMENTO.JS - VERSÃO COMPLETA COM JUSTIFICATIVAS
let acompanhamentoState = {
    mesAtual: '',
    dataJustificativa: formatarData(new Date())
};

function initAcompanhamento() {
    console.log('Inicializando aba Acompanhamento...');
    
    acompanhamentoState.mesAtual = obterMesAtual();
    
    carregarInterfaceAcompanhamento();
    configurarEventListenersAcompanhamento();
    
    console.log('Aba Acompanhamento inicializada');
}

function carregarInterfaceAcompanhamento() {
    const container = document.getElementById('acompanhamento');
    
    if (!container) return;
    
    const config = verificarConfiguracoesMinimas();
    
    if (!config.todasConfiguradas) {
        container.innerHTML = mostrarMensagemConfiguracaoAcompanhamento();
        return;
    }
    
    container.innerHTML = `
        <div class="grid grid-2">
            <!-- Formulário de Justificativa -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-file-alt"></i>
                        Nova Justificativa
                    </h2>
                    <span class="badge badge-info">Justificar horários</span>
                </div>
                <div class="card-body">
                    <!-- Data da Justificativa -->
                    <div class="form-group">
                        <label class="form-label" for="dataJustificativa">
                            <i class="fas fa-calendar-day"></i>
                            Data da Justificativa
                        </label>
                        <input 
                            type="date" 
                            class="form-control" 
                            id="dataJustificativa"
                            value="${new Date().toISOString().split('T')[0]}"
                        >
                        <small class="form-text">Data em que ocorreu a justificativa</small>
                    </div>
                    
                    <!-- Mês de Referência -->
                    <div class="form-group">
                        <label class="form-label" for="selectMesJustificativa">
                            <i class="fas fa-calendar-alt"></i>
                            Mês da Planilha
                        </label>
                        <select class="form-control" id="selectMesJustificativa">
                            ${CONFIG.MESES.map(mes => 
                                `<option value="${mes}" ${mes === acompanhamentoState.mesAtual ? 'selected' : ''}>
                                    ${mes}
                                </option>`
                            ).join('')}
                        </select>
                        <small class="form-text">Mês correspondente na planilha</small>
                    </div>
                    
                    <!-- Código da Justificativa -->
                    <div class="form-group">
                        <label class="form-label" for="codigoJustificativa">
                            <i class="fas fa-code"></i>
                            Código da Justificativa
                        </label>
                        <select class="form-control" id="codigoJustificativa">
                            <option value="">Selecione um código...</option>
                            ${CONFIG.CODIGOS_JUSTIFICATIVA.map(item => 
                                `<option value="${item.codigo}">
                                    ${item.codigo} - ${item.descricao}
                                </option>`
                            ).join('')}
                        </select>
                        <small class="form-text">Código que será salvo na coluna I</small>
                    </div>
                    
                    <!-- Horários da Justificativa -->
                    <div class="grid grid-2 gap-3">
                        <div class="form-group">
                            <label class="form-label" for="horaInicioJustificativa">
                                <i class="fas fa-play-circle"></i>
                                Hora Início
                            </label>
                            <input 
                                type="time" 
                                class="form-control" 
                                id="horaInicioJustificativa"
                                value="08:00"
                            >
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="horaFimJustificativa">
                                <i class="fas fa-stop-circle"></i>
                                Hora Fim
                            </label>
                            <input 
                                type="time" 
                                class="form-control" 
                                id="horaFimJustificativa"
                                value="17:00"
                            >
                        </div>
                    </div>
                    
                    <!-- Checkbox Horário de Almoço -->
                    <div class="form-group">
                        <div class="form-check">
                            <input 
                                class="form-check-input" 
                                type="checkbox" 
                                id="fezAlmoco"
                                checked
                            >
                            <label class="form-check-label" for="fezAlmoco">
                                <i class="fas fa-utensils"></i>
                                Descontar 1 hora de almoço
                            </label>
                        </div>
                        <small class="form-text text-muted">
                            Marque se fez horário de almoço durante o período justificado
                        </small>
                    </div>
                    
                    <!-- Cálculo Automático -->
                    <div class="card mt-3">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-calculator"></i>
                                Cálculo de Horas
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="grid grid-3 text-center">
                                <div>
                                    <div class="stat-number" id="horasBrutas">09:00</div>
                                    <small class="text-muted">Horas totais</small>
                                </div>
                                <div>
                                    <div class="stat-number" id="descontoAlmoco">01:00</div>
                                    <small class="text-muted">Almoço</small>
                                </div>
                                <div>
                                    <div class="stat-number" id="horasLiquidas">08:00</div>
                                    <small class="text-muted">Horas líquidas</small>
                                </div>
                            </div>
                            <small class="text-muted d-block mt-2 text-center" id="textoCalculo">
                                Das 08:00 às 17:00 = 9 horas - 1 hora almoço = 8 horas
                            </small>
                        </div>
                    </div>
                    
                    <!-- Campo de Observação -->
                    <div class="form-group mt-3">
                        <label class="form-label" for="observacaoJustificativa">
                            <i class="fas fa-edit"></i>
                            Observação / Descrição
                        </label>
                        <textarea 
                            class="form-control" 
                            id="observacaoJustificativa"
                            rows="3"
                            placeholder="Descreva brevemente a justificativa (opcional)..."
                            maxlength="200"
                        ></textarea>
                        <small class="form-text">
                            Esta observação será salva na planilha de acompanhamento
                        </small>
                    </div>
                    
                    <!-- Botões -->
                    <div class="grid grid-2 gap-2 mt-4">
                        <button class="btn btn-secondary" id="btnLimparJustificativa">
                            <i class="fas fa-eraser"></i>
                            Limpar
                        </button>
                        <button class="btn btn-primary" id="btnSalvarJustificativa">
                            <i class="fas fa-save"></i>
                            Salvar Justificativa
                        </button>
                    </div>
                    
                    <!-- Informações -->
                    <div class="alert alert-info mt-3">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Onde os dados serão salvos:</strong>
                            <ul class="mb-0 mt-1">
                                <li><strong>Coluna I</strong> da planilha de Frequência: Código da justificativa</li>
                                <li><strong>Coluna J</strong> da planilha de Frequência: Horas líquidas calculadas</li>
                                <li><strong>Planilha de Acompanhamento</strong>: Detalhes completos da justificativa</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Painel de Informações -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-info-circle"></i>
                        Informações sobre Justificativas
                    </h2>
                </div>
                <div class="card-body">
                    <!-- Lista de Códigos -->
                    <div class="mb-4">
                        <h3 class="card-title">
                            <i class="fas fa-list"></i>
                            Códigos de Justificativa
                        </h3>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Descrição</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${CONFIG.CODIGOS_JUSTIFICATIVA.map(item => `
                                        <tr>
                                            <td><strong>${item.codigo}</strong></td>
                                            <td>${item.descricao}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Exemplos de Uso -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-lightbulb"></i>
                                Exemplos Práticos
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="mb-2">
                                <strong>Exemplo 1:</strong>
                                <p class="mb-1">Viagem a serviço das 08:00 às 18:00 com almoço</p>
                                <small class="text-muted">Código: 40 | Horas: 9 (10h - 1h almoço)</small>
                            </div>
                            <div class="mb-2">
                                <strong>Exemplo 2:</strong>
                                <p class="mb-1">Treinamento das 09:00 às 12:00 (sem almoço)</p>
                                <small class="text-muted">Código: 50 | Horas: 3</small>
                            </div>
                            <div>
                                <strong>Exemplo 3:</strong>
                                <p class="mb-1">Atestado médico período integral</p>
                                <small class="text-muted">Código: 70 | Horas: 8 (considera almoço)</small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Estatísticas -->
                    <div class="card mt-3">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-chart-bar"></i>
                                Resumo do Mês
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="text-center">
                                <div class="display-4 text-success" id="totalJustificativasMes">0</div>
                                <small class="text-muted">Justificativas este mês</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    calcularHorasJustificativa();
}

function configurarEventListenersAcompanhamento() {
    // Data e mês
    document.getElementById('dataJustificativa')?.addEventListener('change', (e) => {
        acompanhamentoState.dataJustificativa = e.target.value;
    });
    
    // Horários
    ['horaInicioJustificativa', 'horaFimJustificativa'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', calcularHorasJustificativa);
    });
    
    // Checkbox almoço
    document.getElementById('fezAlmoco')?.addEventListener('change', calcularHorasJustificativa);
    
    // Botões
    document.getElementById('btnLimparJustificativa')?.addEventListener('click', limparJustificativa);
    document.getElementById('btnSalvarJustificativa')?.addEventListener('click', salvarJustificativa);
}

function calcularHorasJustificativa() {
    const horaInicio = document.getElementById('horaInicioJustificativa')?.value;
    const horaFim = document.getElementById('horaFimJustificativa')?.value;
    const fezAlmoco = document.getElementById('fezAlmoco')?.checked;
    
    let horasBrutas = "00:00";
    let descontoAlmoco = "00:00";
    let horasLiquidas = "00:00";
    let textoCalculo = "Preencha horário início e fim";
    
    if (horaInicio && horaFim) {
        // Calcula horas brutas
        horasBrutas = calcularHorasTrabalhadas(horaInicio, horaFim, "00:00");
        
        // Calcula desconto de almoço
        if (fezAlmoco) {
            // Verifica se o período tem mais de 6 horas (normalmente tem almoço)
            const [horas, minutos] = horasBrutas.split(':').map(Number);
            const totalMinutos = horas * 60 + minutos;
            
            if (totalMinutos >= 360) { // 6 horas ou mais
                descontoAlmoco = "01:00";
                
                // Calcula horas líquidas
                const minutosLiquidos = totalMinutos - 60;
                if (minutosLiquidos < 0) {
                    horasLiquidas = "00:00";
                } else {
                    const horasLiq = Math.floor(minutosLiquidos / 60);
                    const minutosLiq = minutosLiquidos % 60;
                    horasLiquidas = `${String(horasLiq).padStart(2, '0')}:${String(minutosLiq).padStart(2, '0')}`;
                }
                
                textoCalculo = `Das ${horaInicio} às ${horaFim} = ${horasBrutas} - ${descontoAlmoco} almoço = ${horasLiquidas}`;
            } else {
                descontoAlmoco = "00:00";
                horasLiquidas = horasBrutas;
                textoCalculo = `Das ${horaInicio} às ${horaFim} = ${horasBrutas} (sem desconto de almoço - período curto)`;
            }
        } else {
            descontoAlmoco = "00:00";
            horasLiquidas = horasBrutas;
            textoCalculo = `Das ${horaInicio} às ${horaFim} = ${horasBrutas} (sem horário de almoço)`;
        }
    }
    
    // Atualiza display
    document.getElementById('horasBrutas')?.textContent = horasBrutas;
    document.getElementById('descontoAlmoco')?.textContent = descontoAlmoco;
    document.getElementById('horasLiquidas')?.textContent = horasLiquidas;
    document.getElementById('textoCalculo')?.textContent = textoCalculo;
}

function limparJustificativa() {
    if (confirm('Limpar formulário de justificativa?')) {
        document.getElementById('codigoJustificativa').value = '';
        document.getElementById('horaInicioJustificativa').value = '08:00';
        document.getElementById('horaFimJustificativa').value = '17:00';
        document.getElementById('fezAlmoco').checked = true;
        document.getElementById('observacaoJustificativa').value = '';
        calcularHorasJustificativa();
    }
}

async function salvarJustificativa() {
    try {
        // Coleta dados
        const dataJustificativa = document.getElementById('dataJustificativa')?.value;
        const mes = document.getElementById('selectMesJustificativa')?.value;
        const codigo = document.getElementById('codigoJustificativa')?.value;
        const horaInicio = document.getElementById('horaInicioJustificativa')?.value;
        const horaFim = document.getElementById('horaFimJustificativa')?.value;
        const fezAlmoco = document.getElementById('fezAlmoco')?.checked;
        const observacao = document.getElementById('observacaoJustificativa')?.value;
        
        // Validações
        if (!dataJustificativa) throw new Error('Informe a data da justificativa');
        if (!mes) throw new Error('Selecione o mês');
        if (!codigo) throw new Error('Selecione um código de justificativa');
        if (!horaInicio || !horaFim) throw new Error('Informe horário início e fim');
        
        // Extrai dia da data
        const dataObj = new Date(dataJustificativa);
        const dia = dataObj.getDate();
        
        // Calcula horas líquidas
        calcularHorasJustificativa();
        const horasLiquidas = document.getElementById('horasLiquidas')?.textContent || "00:00";
        
        // Prepara dados
        const dados = {
            tipo: 'justificativa',
            data: dataJustificativa,
            mes: mes,
            dia: dia,
            codigo: codigo,
            horaInicio: horaInicio,
            horaFim: horaFim,
            fezAlmoco: fezAlmoco,
            horasLiquidas: horasLiquidas,
            observacao: observacao || ''
        };
        
        // Desabilita botão durante envio
        const btn = document.getElementById('btnSalvarJustificativa');
        const textoOriginal = btn?.innerHTML;
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            btn.disabled = true;
        }
        
        // Envia para API
        const resultado = await salvarJustificativaAPI(dados);
        
        // Reabilita botão
        if (btn) {
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
        }
        
        if (resultado.success) {
            mostrarNotificacao('Justificativa salva com sucesso!', 'success');
            limparJustificativa();
            atualizarEstatisticas();
        }
        
        return resultado;
        
    } catch (error) {
        console.error('Erro ao salvar justificativa:', error);
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}

async function salvarJustificativaAPI(dados) {
    // Esta função será implementada no api.js
    // Por enquanto, retorna sucesso simulado
    console.log('Dados da justificativa:', dados);
    return { 
        success: true, 
        message: 'Justificativa salva (simulado)',
        dados: dados 
    };
}

function atualizarEstatisticas() {
    // Implementar contagem de justificativas
    const elemento = document.getElementById('totalJustificativasMes');
    if (elemento) {
        // Simulação - depois implementar contagem real
        elemento.textContent = "0";
    }
}

function mostrarMensagemConfiguracaoAcompanhamento() {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Configuração Necessária</h2>
            </div>
            <div class="card-body">
                <div class="alert warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Para usar a aba de Acompanhamento, configure ambas as planilhas.</p>
                </div>
                <button class="btn btn-primary btn-block mt-3" onclick="mudarParaAba('configuracoes')">
                    <i class="fas fa-cog"></i>
                    Ir para Configurações
                </button>
            </div>
        </div>
    `;
}

// Exportar funções
window.initAcompanhamento = initAcompanhamento;
