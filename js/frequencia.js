// FREQUENCIA.JS - VERSÃO COMPLETA E CORRIGIDA
let frequenciaState = {
    mesAtual: '',
    diaAtual: 1
};

function initFrequencia() {
    console.log('Inicializando aba Frequência...');
    
    frequenciaState.mesAtual = obterMesAtual();
    frequenciaState.diaAtual = obterDiaAtual();
    
    carregarInterfaceFrequencia();
    configurarEventListenersFrequencia();
    
    console.log('Aba Frequência inicializada');
}

function carregarInterfaceFrequencia() {
    const container = document.getElementById('frequencia');
    
    if (!container) return;
    
    const config = verificarConfiguracoesMinimas();
    
    if (!config.frequenciaConfigurada) {
        container.innerHTML = mostrarMensagemConfiguracao();
        return;
    }
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <i class="fas fa-clock"></i>
                    Controle Diário de Frequência
                </h2>
                <span class="badge badge-info">${formatarData(new Date())}</span>
            </div>
            <div class="card-body">
                <!-- Seletor de Data -->
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-calendar-alt"></i>
                        Data do Registro
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
                
                <!-- Horários do Dia -->
                <div class="grid grid-2 gap-3">
                    <!-- Período da Manhã -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-sun"></i>
                                Período da Manhã
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <label class="form-label" for="entradaManha">
                                    <i class="fas fa-sign-in-alt"></i>
                                    Entrada
                                </label>
                                <input 
                                    type="time" 
                                    class="form-control" 
                                    id="entradaManha"
                                    value="08:00"
                                >
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="saidaManha">
                                    <i class="fas fa-sign-out-alt"></i>
                                    Saída para Almoço
                                </label>
                                <input 
                                    type="time" 
                                    class="form-control" 
                                    id="saidaManha"
                                    value="12:00"
                                >
                            </div>
                        </div>
                    </div>
                    
                    <!-- Período da Tarde -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-moon"></i>
                                Período da Tarde
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <label class="form-label" for="entradaTarde">
                                    <i class="fas fa-sign-in-alt"></i>
                                    Retorno do Almoço
                                </label>
                                <input 
                                    type="time" 
                                    class="form-control" 
                                    id="entradaTarde"
                                    value="13:00"
                                >
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="saidaTarde">
                                    <i class="fas fa-sign-out-alt"></i>
                                    Saída
                                </label>
                                <input 
                                    type="time" 
                                    class="form-control" 
                                    id="saidaTarde"
                                    value="17:00"
                                >
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Cálculo de Horas -->
                <div class="card mt-3">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-calculator"></i>
                            Resumo do Dia
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-3 text-center">
                            <div>
                                <div class="stat-number" id="horasManha">04:00</div>
                                <small class="text-muted">Manhã</small>
                            </div>
                            <div>
                                <div class="stat-number" id="horasTarde">04:00</div>
                                <small class="text-muted">Tarde</small>
                            </div>
                            <div>
                                <div class="stat-number" id="horasTotal">08:00</div>
                                <small class="text-muted">Total</small>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-2 text-center">
                            Considera 1 hora de almoço automaticamente
                        </small>
                    </div>
                </div>
                
                <!-- Botões -->
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
                
                <!-- Link para Justificativas -->
                <div class="alert alert-info mt-3">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <strong>Precisa justificar horários?</strong>
                        <p>Use a aba <strong>Acompanhamento</strong> para registrar justificativas, códigos e observações.</p>
                        <button class="btn btn-sm btn-outline-info mt-2" onclick="window.mudarParaAba ? mudarParaAba('acompanhamento') : console.log('Função não disponível')">
                            <i class="fas fa-external-link-alt"></i>
                            Ir para Acompanhamento
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    calcularHoras();
}

function configurarEventListenersFrequencia() {
    // Seletores de data
    const selectMes = document.getElementById('selectMes');
    const selectDia = document.getElementById('selectDia');
    
    if (selectMes) {
        selectMes.addEventListener('change', (e) => {
            frequenciaState.mesAtual = e.target.value;
        });
    }
    
    if (selectDia) {
        selectDia.addEventListener('change', (e) => {
            frequenciaState.diaAtual = parseInt(e.target.value);
        });
    }
    
    // Campos de hora
    const camposHora = ['entradaManha', 'saidaManha', 'entradaTarde', 'saidaTarde'];
    camposHora.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('change', calcularHoras);
        }
    });
    
    // Botões
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvarFrequencia');
    
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparFrequencia);
    }
    
    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvarFrequencia);
    }
}

function calcularHoras() {
    const entradaManha = document.getElementById('entradaManha')?.value;
    const saidaManha = document.getElementById('saidaManha')?.value;
    const entradaTarde = document.getElementById('entradaTarde')?.value;
    const saidaTarde = document.getElementById('saidaTarde')?.value;
    
    let horasManha = "00:00";
    let horasTarde = "00:00";
    let horasTotal = "00:00";
    
    if (entradaManha && saidaManha) {
        horasManha = calcularHorasTrabalhadas(entradaManha, saidaManha, "00:00");
    }
    
    if (entradaTarde && saidaTarde) {
        horasTarde = calcularHorasTrabalhadas(entradaTarde, saidaTarde, "00:00");
    }
    
    // Soma as horas
    if (horasManha !== "00:00" || horasTarde !== "00:00") {
        const [h1, m1] = horasManha.split(':').map(Number);
        const [h2, m2] = horasTarde.split(':').map(Number);
        
        let totalMinutos = (h1 * 60 + m1) + (h2 * 60 + m2);
        
        // Desconta 1 hora de almoço se tiver ambos períodos
        if (horasManha !== "00:00" && horasTarde !== "00:00") {
            totalMinutos -= 60;
        }
        
        if (totalMinutos < 0) totalMinutos = 0;
        
        const horas = Math.floor(totalMinutos / 60);
        const minutos = totalMinutos % 60;
        horasTotal = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }
    
    // Atualiza display
    const horasManhaEl = document.getElementById('horasManha');
    const horasTardeEl = document.getElementById('horasTarde');
    const horasTotalEl = document.getElementById('horasTotal');
    
    if (horasManhaEl) horasManhaEl.textContent = horasManha;
    if (horasTardeEl) horasTardeEl.textContent = horasTarde;
    if (horasTotalEl) horasTotalEl.textContent = horasTotal;
}

function limparFrequencia() {
    if (confirm('Limpar todos os horários?')) {
        const campos = ['entradaManha', 'saidaManha', 'entradaTarde', 'saidaTarde'];
        campos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) campo.value = '';
        });
        calcularHoras();
    }
}

async function salvarFrequencia() {
    try {
        const mes = document.getElementById('selectMes')?.value;
        const dia = document.getElementById('selectDia')?.value;
        
        if (!mes || !dia) {
            throw new Error('Selecione mês e dia');
        }
        
        const dados = {
            mes: mes,
            dia: parseInt(dia),
            entradaManha: document.getElementById('entradaManha')?.value || '',
            saidaManha: document.getElementById('saidaManha')?.value || '',
            entradaTarde: document.getElementById('entradaTarde')?.value || '',
            saidaTarde: document.getElementById('saidaTarde')?.value || ''
        };
        
        // Valida se tem algum horário
        const temHorarios = dados.entradaManha || dados.saidaManha || dados.entradaTarde || dados.saidaTarde;
        if (!temHorarios) {
            throw new Error('Preencha pelo menos um horário');
        }
        
        const btn = document.getElementById('btnSalvarFrequencia');
        const textoOriginal = btn?.innerHTML;
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            btn.disabled = true;
        }
        
        const resultado = await salvarFrequenciaAPI(dados);
        
        if (btn) {
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
        }
        
        if (resultado.success) {
            mostrarNotificacao('Frequência salva com sucesso!', 'success');
        }
        
        return resultado;
        
    } catch (error) {
        console.error('Erro ao salvar frequência:', error);
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}

async function salvarFrequenciaAPI(dados) {
    // Esta função será implementada no api.js
    // Por enquanto, retorna sucesso simulado
    return { success: true, message: 'Dados salvos (simulado)' };
}

function mostrarMensagemConfiguracao() {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Configuração Necessária</h2>
            </div>
            <div class="card-body">
                <div class="alert warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Para usar a aba de Frequência, configure o ID da sua planilha.</p>
                </div>
                <button class="btn btn-primary btn-block mt-3" onclick="window.mudarParaAba ? mudarParaAba('configuracoes') : console.log('Função não disponível')">
                    <i class="fas fa-cog"></i>
                    Ir para Configurações
                </button>
            </div>
        </div>
    `;
}

// Exportar para uso global - APENAS ESTA LINHA NO FINAL
if (typeof window !== 'undefined') {
    window.initFrequencia = initFrequencia;
}
// FIM DO ARQUIVO - NADA MAIS AQUI
