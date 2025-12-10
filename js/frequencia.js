// LÓGICA DA ABA FREQUÊNCIA

// Variáveis globais da aba frequência
let frequenciaState = {
    mesAtual: '',
    diaAtual: 1,
    entradaManha: '',
    saidaManha: '',
    entradaTarde: '',
    saidaTarde: '',
    codigoJustificativa: '',
    calculoAutomatico: true
};

/**
 * Inicializa a aba de frequência
 */
function initFrequencia() {
    console.log('Inicializando aba Frequência...');
    
    // Atualiza estado
    frequenciaState.mesAtual = obterMesAtual();
    frequenciaState.diaAtual = obterDiaAtual();
    
    // Carrega interface
    carregarInterfaceFrequencia();
    
    // Carrega dados salvos para hoje (se existirem)
    carregarDadosHoje();
    
    // Configura event listeners
    configurarEventListenersFrequencia();
    
    console.log('Aba Frequência inicializada');
}

/**
 * Carrega a interface da aba frequência
 */
function carregarInterfaceFrequencia() {
    const container = document.getElementById('frequencia');
    
    if (!container) {
        console.error('Container da aba frequência não encontrado');
        return;
    }
    
    // Verifica se as configurações mínimas estão preenchidas
    const config = verificarConfiguracoesMinimas();
    
    if (!config.frequenciaConfigurada) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Configuração Necessária</h2>
                </div>
                <div class="card-body">
                    <div class="alert warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Para usar a aba de Frequência, você precisa configurar o ID da sua planilha.</p>
                    </div>
                    <button class="btn btn-primary btn-block mt-3" onclick="mudarParaAba('configuracoes')">
                        <i class="fas fa-cog"></i>
                        Ir para Configurações
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    // Interface principal da frequência
    container.innerHTML = `
        <div class="grid grid-2">
            <!-- Painel de Controle -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-calendar-day"></i>
                        Controle Diário
                    </h2>
                    <span class="badge badge-info" id="dataAtualDisplay">
                        ${formatarData(new Date())}
                    </span>
                </div>
                <div class="card-body">
                    <!-- Seletor de Data -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-calendar-alt"></i>
                            Selecione a Data
                        </label>
                        <div class="grid grid-2 gap-2">
                            <select class="form-control" id="selectMes">
                                ${CONFIG.MESES.map(mes => 
                                    `<option value="${mes}" ${mes === frequenciaState.mesAtual ? 'selected' : ''}>
                                        ${mes}
                                    </option>`
                                ).join('')}
                            </select>
                            <select class="form-control" id="selectDia">
                                ${Array.from({length: 31}, (_, i) => i + 1)
                                    .map(dia => 
                                        `<option value="${dia}" ${dia === frequenciaState.diaAtual ? 'selected' : ''}>
                                            ${dia.toString().padStart(2, '0')}
                                        </option>`
                                    ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <!-- Entrada Manhã -->
                    <div class="form-group">
                        <label class="form-label" for="entradaManha">
                            <i class="fas fa-sign-in-alt"></i>
                            Entrada Manhã
                        </label>
                        <input 
                            type="time" 
                            class="form-control" 
                            id="entradaManha"
                            value="08:00"
                        >
                        <small class="form-text">Horário de entrada no período da manhã</small>
                    </div>
                    
                    <!-- Saída Manhã -->
                    <div class="form-group">
                        <label class="form-label" for="saidaManha">
                            <i class="fas fa-sign-out-alt"></i>
                            Saída Manhã
                        </label>
                        <input 
                            type="time" 
                            class="form-control" 
                            id="saidaManha"
                            value="12:00"
                        >
                        <small class="form-text">Horário de saída para almoço</small>
                    </div>
                    
                    <!-- Entrada Tarde -->
                    <div class="form-group">
                        <label class="form-label" for="entradaTarde">
                            <i class="fas fa-sign-in-alt"></i>
                            Entrada Tarde
                        </label>
                        <input 
                            type="time" 
                            class="form-control" 
                            id="entradaTarde"
                            value="13:00"
                        >
                        <small class="form-text">Horário de retorno do almoço</small>
                    </div>
                    
                    <!-- Saída Tarde -->
                    <div class="form-group">
                        <label class="form-label" for="saidaTarde">
                            <i class="fas fa-sign-out-alt"></i>
                            Saída Tarde
                        </label>
                        <input 
                            type="time" 
                            class="form-control" 
                            id="saidaTarde"
                            value="17:00"
                        >
                        <small class="form-text">Horário de saída no final do dia</small>
                    </div>
                    
                    <!-- Botões de Ação -->
                    <div class="grid grid-2 gap-2 mt-4">
                        <button class="btn btn-secondary" id="btnLimpar">
                            <i class="fas fa-eraser"></i>
                            Limpar
                        </button>
                        <button class="btn btn-primary" id="btnSalvarFrequencia">
                            <i class="fas fa-save"></i>
                            Salvar Frequência
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Painel de Justificativas -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-file-alt"></i>
                        Justificativas
                    </h2>
                    <button class="btn btn-sm btn-success" id="btnInfoJustificativas">
                        <i class="fas fa-info-circle"></i>
                        Info
                    </button>
                </div>
                <div class="card-body">
                    <!-- Código Justificativa -->
                    <div class="form-group">
                        <label class="form-label" for="codigoJustificativa">
                            <i class="fas fa-code"></i>
                            Código Justificativa
                        </label>
                        <select class="form-control" id="codigoJustificativa">
                            <option value="">Selecione um código...</option>
                            ${CONFIG.CODIGOS_JUSTIFICATIVA.map(item => 
                                `<option value="${item.codigo}">
                                    ${item.codigo} - ${item.descricao}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <!-- Informações Adicionais -->
                    <div class="form-group" id="justificativaExtra" style="display: none;">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i>
                            <p><strong>Informação:</strong> Ao selecionar um código de justificativa, 
                            os horários de entrada/saída acima serão considerados como parte da justificativa.</p>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="horaInicioJustificativa">
                                <i class="fas fa-clock"></i>
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
                                <i class="fas fa-clock"></i>
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
                    
                    <!-- Calculadora de Horas -->
                    <div class="card mt-3">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-calculator"></i>
                                Calculadora de Horas
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-clock"></i>
                                    Horas Trabalhadas
                                </label>
                                <div class="d-flex align-items-center gap-2">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="horasTrabalhadas"
                                        value="08:00"
                                        readonly
                                        style="background-color: var(--branco-gelo);"
                                    >
                                    <button class="btn btn-icon btn-secondary" id="btnCalcularHoras" title="Calcular automaticamente">
                                        <i class="fas fa-calculator"></i>
                                    </button>
                                </div>
                                <small class="form-text">Horas totais descontando almoço (1h)</small>
                            </div>
                            
                            <div class="alert alert-success mt-3" id="resumoHoras" style="display: none;">
                                <i class="fas fa-check-circle"></i>
                                <div>
                                    <strong>Resumo do Dia:</strong>
                                    <p id="textoResumoHoras"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botão Salvar Justificativa -->
                    <button class="btn btn-success btn-block mt-3" id="btnSalvarJustificativa">
                        <i class="fas fa-check-double"></i>
                        Salvar Justificativa
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Painel de Resumo -->
        <div class="card mt-3">
            <div class="card-header">
                <h2 class="card-title">
                    <i class="fas fa-history"></i>
                    Últimos Registros
                </h2>
                <button class="btn btn-sm btn-secondary" id="btnAtualizarHistorico">
                    <i class="fas fa-sync-alt"></i>
                    Atualizar
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table" id="tabelaHistorico">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Entrada</th>
                                <th>Saída</th>
                                <th>Justificativa</th>
                                <th>Horas</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="6" class="text-center">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    Carregando histórico...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Atualiza display da data atual
    atualizarDataAtualDisplay();
}

/**
 * Configura os event listeners da aba frequência
 */
function configurarEventListenersFrequencia() {
    // Seletores de data
    const selectMes = document.getElementById('selectMes');
    const selectDia = document.getElementById('selectDia');
    
    if (selectMes) {
        selectMes.addEventListener('change', (e) => {
            frequenciaState.mesAtual = e.target.value;
            console.log('Mês alterado para:', frequenciaState.mesAtual);
        });
    }
    
    if (selectDia) {
        selectDia.addEventListener('change', (e) => {
            frequenciaState.diaAtual = parseInt(e.target.value);
            console.log('Dia alterado para:', frequenciaState.diaAtual);
            carregarDadosDataSelecionada();
        });
    }
    
    // Campos de horário
    const camposHora = ['entradaManha', 'saidaManha', 'entradaTarde', 'saidaTarde'];
    camposHora.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('change', (e) => {
                frequenciaState[id] = e.target.value;
                console.log(`${id}: ${e.target.value}`);
                
                // Calcula horas automaticamente se habilitado
                if (frequenciaState.calculoAutomatico) {
                    calcularHorasTrabalhadasAuto();
                }
            });
        }
    });
    
    // Código de justificativa
    const codigoJustificativa = document.getElementById('codigoJustificativa');
    if (codigoJustificativa) {
        codigoJustificativa.addEventListener('change', (e) => {
            frequenciaState.codigoJustificativa = e.target.value;
            console.log('Código justificativa:', e.target.value);
            
            // Mostra/oculta campos extras
            const justificativaExtra = document.getElementById('justificativaExtra');
            if (justificativaExtra) {
                justificativaExtra.style.display = e.target.value ? 'block' : 'none';
            }
            
            // Atualiza cálculo de horas
            calcularHorasTrabalhadasAuto();
        });
    }
    
    // Botão calcular horas
    const btnCalcularHoras = document.getElementById('btnCalcularHoras');
    if (btnCalcularHoras) {
        btnCalcularHoras.addEventListener('click', calcularHorasTrabalhadasManual);
    }
    
    // Botão salvar frequência
    const btnSalvarFrequencia = document.getElementById('btnSalvarFrequencia');
    if (btnSalvarFrequencia) {
        btnSalvarFrequencia.addEventListener('click', salvarFrequenciaAtual);
    }
    
    // Botão salvar justificativa
    const btnSalvarJustificativa = document.getElementById('btnSalvarJustificativa');
    if (btnSalvarJustificativa) {
        btnSalvarJustificativa.addEventListener('click', salvarJustificativaAtual);
    }
    
    // Botão limpar
    const btnLimpar = document.getElementById('btnLimpar');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparFormularioFrequencia);
    }
    
    // Botão info justificativas
    const btnInfoJustificativas = document.getElementById('btnInfoJustificativas');
    if (btnInfoJustificativas) {
        btnInfoJustificativas.addEventListener('click', mostrarInfoJustificativas);
    }
    
    // Botão atualizar histórico
    const btnAtualizarHistorico = document.getElementById('btnAtualizarHistorico');
    if (btnAtualizarHistorico) {
        btnAtualizarHistorico.addEventListener('click', carregarHistoricoLocal);
    }
    
    // Configura cálculo automático de horas
    configurarCalculoAutomaticoHoras();
}

/**
 * Configura cálculo automático de horas
 */
function configurarCalculoAutomaticoHoras() {
    // Observa mudanças em todos os campos de hora
    const observador = debounce(() => {
        if (frequenciaState.calculoAutomatico) {
            calcularHorasTrabalhadasAuto();
        }
    }, 500);
    
    const campos = ['entradaManha', 'saidaManha', 'entradaTarde', 'saidaTarde'];
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', observador);
            campo.addEventListener('change', observador);
        }
    });
}

/**
 * Calcula horas trabalhadas automaticamente
 */
function calcularHorasTrabalhadasAuto() {
    try {
        // Obtém valores dos campos
        const entradaManha = document.getElementById('entradaManha')?.value || '';
        const saidaManha = document.getElementById('saidaManha')?.value || '';
        const entradaTarde = document.getElementById('entradaTarde')?.value || '';
        const saidaTarde = document.getElementById('saidaTarde')?.value || '';
        
        // Se tem justificativa, usa horários específicos
        const codigoJustificativa = document.getElementById('codigoJustificativa')?.value || '';
        
        let horasCalculadas = "00:00";
        
        if (codigoJustificativa) {
            // Para justificativas, usa horários específicos se preenchidos
            const horaInicio = document.getElementById('horaInicioJustificativa')?.value || entradaManha || '08:00';
            const horaFim = document.getElementById('horaFimJustificativa')?.value || saidaTarde || '17:00';
            
            horasCalculadas = calcularHorasTrabalhadas(horaInicio, horaFim, "01:00");
        } else {
            // Para dia normal, calcula baseado nos períodos
            if (entradaManha && saidaTarde) {
                const horasManha = calcularHorasTrabalhadas(entradaManha, saidaManha || '12:00', "00:00");
                const horasTarde = calcularHorasTrabalhadas(entradaTarde || '13:00', saidaTarde, "00:00");
                
                // Soma as horas
                const [h1, m1] = horasManha.split(':').map(Number);
                const [h2, m2] = horasTarde.split(':').map(Number);
                
                let totalMinutos = (h1 * 60 + m1) + (h2 * 60 + m2) - 60; // Desconta 1h de almoço
                if (totalMinutos < 0) totalMinutos = 0;
                
                const horas = Math.floor(totalMinutos / 60);
                const minutos = totalMinutos % 60;
                
                horasCalculadas = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
            }
        }
        
        // Atualiza campo de horas trabalhadas
        const campoHoras = document.getElementById('horasTrabalhadas');
        if (campoHoras) {
            campoHoras.value = horasCalculadas;
            
            // Atualiza resumo
            atualizarResumoHoras(horasCalculadas, codigoJustificativa);
        }
        
    } catch (error) {
        console.error('Erro ao calcular horas:', error);
    }
}

/**
 * Calcula horas trabalhadas manualmente (botão)
 */
function calcularHorasTrabalhadasManual() {
    frequenciaState.calculoAutomatico = !frequenciaState.calculoAutomatico;
    
    const btnCalcularHoras = document.getElementById('btnCalcularHoras');
    if (btnCalcularHoras) {
        if (frequenciaState.calculoAutomatico) {
            btnCalcularHoras.title = "Cálculo automático ativado";
            btnCalcularHoras.innerHTML = '<i class="fas fa-robot"></i>';
            btnCalcularHoras.classList.remove('btn-secondary');
            btnCalcularHoras.classList.add('btn-success');
            calcularHorasTrabalhadasAuto();
        } else {
            btnCalcularHoras.title = "Cálculo manual - clique para calcular";
            btnCalcularHoras.innerHTML = '<i class="fas fa-calculator"></i>';
            btnCalcularHoras.classList.remove('btn-success');
            btnCalcularHoras.classList.add('btn-secondary');
        }
    }
}

/**
 * Atualiza resumo de horas
 */
function atualizarResumoHoras(horas, codigoJustificativa) {
    const resumoHoras = document.getElementById('resumoHoras');
    const textoResumoHoras = document.getElementById('textoResumoHoras');
    
    if (!resumoHoras || !textoResumoHoras) return;
    
    if (horas && horas !== "00:00") {
        const horasAmigavel = formatarHorasAmigavel(horas);
        
        if (codigoJustificativa) {
            const justificativa = CONFIG.CODIGOS_JUSTIFICATIVA.find(
                item => item.codigo === codigoJustificativa
            );
            
            textoResumoHoras.innerHTML = `
                <strong>${horasAmigavel}</strong> de trabalho justificado<br>
                <small>Código: ${codigoJustificativa} - ${justificativa?.descricao || 'Justificativa'}</small>
            `;
        } else {
            textoResumoHoras.innerHTML = `
                <strong>${horasAmigavel}</strong> de trabalho no dia<br>
                <small>Inclui 1 hora de almoço</small>
            `;
        }
        
        resumoHoras.style.display = 'block';
    } else {
        resumoHoras.style.display = 'none';
    }
}

/**
 * Atualiza display da data atual
 */
function atualizarDataAtualDisplay() {
    const dataAtualDisplay = document.getElementById('dataAtualDisplay');
    if (dataAtualDisplay) {
        const hoje = new Date();
        const dataFormatada = formatarData(hoje);
        const diaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });
        
        dataAtualDisplay.innerHTML = `
            ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}<br>
            <small>${dataFormatada}</small>
        `;
    }
}

/**
 * Carrega dados para o dia de hoje
 */
function carregarDadosHoje() {
    // Por enquanto, carrega valores padrão
    // Futuramente pode carregar do localStorage ou da planilha
    
    const hoje = new Date();
    const dia = hoje.getDate();
    
    // Atualiza seletores
    const selectDia = document.getElementById('selectDia');
    if (selectDia) {
        selectDia.value = dia;
        frequenciaState.diaAtual = dia;
    }
    
    // Define valores padrão nos campos
    const camposPadrao = {
        entradaManha: '08:00',
        saidaManha: '12:00',
        entradaTarde: '13:00',
        saidaTarde: '17:00',
        horasTrabalhadas: '08:00'
    };
    
    Object.entries(camposPadrao).forEach(([id, valor]) => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.value = valor;
            frequenciaState[id] = valor;
        }
    });
    
    // Calcula horas
    calcularHorasTrabalhadasAuto();
}

/**
 * Carrega dados para data selecionada
 */
function carregarDadosDataSelecionada() {
    // Por enquanto, limpa os campos
    // Futuramente pode carregar dados salvos
    
    const campos = ['entradaManha', 'saidaManha', 'entradaTarde', 'saidaTarde', 'codigoJustificativa'];
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            if (campo.tagName === 'SELECT') {
                campo.value = '';
            } else {
                campo.value = '';
            }
            frequenciaState[id] = '';
        }
    });
    
    // Oculta campos extras de justificativa
    const justificativaExtra = document.getElementById('justificativaExtra');
    if (justificativaExtra) {
        justificativaExtra.style.display = 'none';
    }
    
    // Reseta horas
    const campoHoras = document.getElementById('horasTrabalhadas');
    if (campoHoras) {
        campoHoras.value = '00:00';
    }
    
    // Oculta resumo
    const resumoHoras = document.getElementById('resumoHoras');
    if (resumoHoras) {
        resumoHoras.style.display = 'none';
    }
    
    console.log(`Dados carregados para ${frequenciaState.diaAtual}/${frequenciaState.mesAtual}`);
}

/**
 * Limpa formulário de frequência
 */
function limparFormularioFrequencia() {
    if (confirm('Deseja limpar todos os campos do formulário?')) {
        const campos = ['entradaManha', 'saidaManha', 'entradaTarde', 'saidaTarde'];
        campos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.value = '';
                frequenciaState[id] = '';
            }
        });
        
        const codigoJustificativa = document.getElementById('codigoJustificativa');
        if (codigoJustificativa) {
            codigoJustificativa.value = '';
            frequenciaState.codigoJustificativa = '';
        }
        
        const justificativaExtra = document.getElementById('justificativaExtra');
        if (justificativaExtra) {
            justificativaExtra.style.display = 'none';
        }
        
        const campoHoras = document.getElementById('horasTrabalhadas');
        if (campoHoras) {
            campoHoras.value = '00:00';
        }
        
        const resumoHoras = document.getElementById('resumoHoras');
        if (resumoHoras) {
            resumoHoras.style.display = 'none';
        }
        
        mostrarNotificacao('Formulário limpo com sucesso', 'success');
    }
}

/**
 * Salva frequência atual
 */
async function salvarFrequenciaAtual() {
    try {
        // Validações
        const mes = document.getElementById('selectMes')?.value;
        const dia = document.getElementById('selectDia')?.value;
        
        if (!mes || !dia) {
            throw new Error('Selecione mês e dia');
        }
        
        // Coleta dados do formulário
        const dados = {
            mes: mes,
            dia: parseInt(dia),
            entradaManha: document.getElementById('entradaManha')?.value || '',
            saidaManha: document.getElementById('saidaManha')?.value || '',
            entradaTarde: document.getElementById('entradaTarde')?.value || '',
            saidaTarde: document.getElementById('saidaTarde')?.value || '',
            codigoJustificativa: document.getElementById('codigoJustificativa')?.value || ''
        };
        
        // Valida se tem pelo menos algum horário
        const temHorarios = dados.entradaManha || dados.saidaManha || dados.entradaTarde || dados.saidaTarde;
        if (!temHorarios && !dados.codigoJustificativa) {
            throw new Error('Preencha pelo menos um horário ou selecione uma justificativa');
        }
        
        // Desabilita botão durante o envio
        const btnSalvar = document.getElementById('btnSalvarFrequencia');
        const textoOriginal = btnSalvar?.innerHTML;
        if (btnSalvar) {
            btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            btnSalvar.disabled = true;
        }
        
        // Envia para API
        const resultado = await salvarFrequencia(dados);
        
        // Reabilita botão
        if (btnSalvar) {
            btnSalvar.innerHTML = textoOriginal;
            btnSalvar.disabled = false;
        }
        
        // Se sucesso, atualiza histórico
        if (resultado.success) {
            carregarHistoricoLocal();
        }
        
        return resultado;
        
    } catch (error) {
        console.error('Erro ao salvar frequência:', error);
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}

/**
 * Salva justificativa atual
 */
async function salvarJustificativaAtual() {
    try {
        // Validações
        const codigo = document.getElementById('codigoJustificativa')?.value;
        if (!codigo) {
            throw new Error('Selecione um código de justificativa');
        }
        
        const mes = document.getElementById('selectMes')?.value;
        const dia = document.getElementById('selectDia')?.value;
        
        if (!mes || !dia) {
            throw new Error('Selecione mês e dia');
        }
        
        // Coleta dados
        const dados = {
            mes: mes,
            dia: parseInt(dia),
            codigo: codigo,
            dataJustificativa: `${dia.toString().padStart(2, '0')}/${String(CONFIG.MESES.indexOf(mes) + 1).padStart(2, '0')}/${new Date().getFullYear()}`,
            horaInicio: document.getElementById('horaInicioJustificativa')?.value || '08:00',
            horaFim: document.getElementById('horaFimJustificativa')?.value || '17:00'
        };
        
        // Desabilita botão durante o envio
        const btnSalvar = document.getElementById('btnSalvarJustificativa');
        const textoOriginal = btnSalvar?.innerHTML;
        if (btnSalvar) {
            btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            btnSalvar.disabled = true;
        }
        
        // Envia para API
        const resultado = await salvarJustificativa(dados);
        
        // Reabilita botão
        if (btnSalvar) {
            btnSalvar.innerHTML = textoOriginal;
            btnSalvar.disabled = false;
        }
        
        // Se sucesso, limpa formulário
        if (resultado.success) {
            const codigoSelect = document.getElementById('codigoJustificativa');
            if (codigoSelect) codigoSelect.value = '';
            
            const justificativaExtra = document.getElementById('justificativaExtra');
            if (justificativaExtra) justificativaExtra.style.display = 'none';
            
            carregarHistoricoLocal();
        }
        
        return resultado;
        
    } catch (error) {
        console.error('Erro ao salvar justificativa:', error);
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}

/**
 * Mostra informações sobre justificativas
 */
function mostrarInfoJustificativas() {
    const listaJustificativas = CONFIG.CODIGOS_JUSTIFICATIVA.map(item => 
        `<div class="mb-2">
            <strong>${item.codigo}</strong>: ${item.descricao}
        </div>`
    ).join('');
    
    const conteudo = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i>
            <p><strong>Instruções:</strong></p>
            <p>1. Selecione o código correspondente à justificativa</p>
            <p>2. Ajuste os horários de início e fim se necessário</p>
            <p>3. Clique em "Salvar Justificativa"</p>
        </div>
        
        <h4>Códigos Disponíveis:</h4>
        <div style="max-height: 300px; overflow-y: auto;">
            ${listaJustificativas}
        </div>
    `;
    
    mostrarModal('Códigos de Justificativa', conteudo);
}

/**
 * Carrega histórico local
 */
function carregarHistoricoLocal() {
    const tabela = document.getElementById('tabelaHistorico');
    if (!tabela) return;
    
    // Por enquanto, mostra mensagem
    // Futuramente pode carregar do localStorage
    
    const tbody = tabela.querySelector('tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <i class="fas fa-history"></i>
                    <p class="mt-2">Histórico de registros aparecerá aqui</p>
                    <small class="text-muted">Os últimos 10 registros serão exibidos</small>
                </td>
            </tr>
        `;
    }
}

/**
 * Função para mudar de aba
 */
function mudarParaAba(aba) {
    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach(btn => {
        if (btn.dataset.tab === aba) {
            btn.click();
        }
    });
}
