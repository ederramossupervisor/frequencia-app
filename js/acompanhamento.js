// ACOMPANHAMENTO.JS - VERSÃO COMPLETA COM BOTÃO PARA ABRIR PLANILHA
let acompanhamentoState = {
    mesAtual: '',
    dataJustificativa: formatarData(new Date())
};

function initAcompanhamento() {
    console.log('Inicializando aba Acompanhamento...');
    document.querySelector('#acompanhamento .loading')?.remove();
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
                        <select class="form-control" id="codigoJustificativa" required>
                            <option value="">Selecione um código...</option>
                            ${CONFIG.CODIGOS_JUSTIFICATIVA.map(item => 
                                `<option value="${item.codigo}" data-desc="${item.descricao}">
                                    ${item.codigo} - ${item.descricao}
                                </option>`
                            ).join('')}
                        </select>
                        <small class="form-text">Código que será salvo na coluna I</small>
                        <div id="codigoHelp" class="text-danger" style="display: none; font-size: 0.9rem; margin-top: 5px;">
                            ⚠️ Por favor, selecione um código
                        </div>
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
                        <small class="text-muted">
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
                    
                    <!-- Campo de Observação (OBRIGATÓRIO) -->
                    <div class="form-group mt-3">
                        <label class="form-label" for="observacaoJustificativa">
                            <i class="fas fa-edit"></i>
                            Observação <span style="color: red;">*</span>
                        </label>
                        <textarea 
                            class="form-control" 
                            id="observacaoJustificativa"
                            rows="3"
                            placeholder="Digite a observação (obrigatório)..."
                            maxlength="200"
                            required
                            oninput="validarObservacao()"
                        ></textarea>
                        <small class="form-text text-danger" id="obsError" style="display: none;">
                            <i class="fas fa-exclamation-circle"></i> Este campo é obrigatório
                        </small>
                        <small class="form-text">
                            Esta observação será salva na planilha de acompanhamento
                        </small>
                    </div>
                    
                    <!-- Botões PRINCIPAIS -->
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
                    
                    <!-- Botão para ABRIR PLANILHA -->
                    <div class="mt-3">
                        <button class="btn btn-outline-success btn-block" id="btnAbrirPlanilhaAcompanhamento">
                            <i class="fas fa-external-link-alt"></i>
                            Abrir Minha Planilha de Acompanhamento
                        </button>
                        <small class="text-muted d-block mt-1 text-center">
                            Abre sua planilha no Google Sheets para verificar os dados
                        </small>
                    </div>
                    
                    <!-- Botão de Teste Temporário -->
                    <div class="mt-3">
                        <button class="btn btn-warning btn-sm" id="btnTesteJustificativa">
                            <i class="fas fa-vial"></i>
                            Testar Seleção de Código
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
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', calcularHorasJustificativa);
        }
    });
    
    // Checkbox almoço
    const fezAlmocoCheckbox = document.getElementById('fezAlmoco');
    if (fezAlmocoCheckbox) {
        fezAlmocoCheckbox.addEventListener('change', calcularHorasJustificativa);
    }
    
    // Validação do código em tempo real
    const codigoSelect = document.getElementById('codigoJustificativa');
    if (codigoSelect) {
        codigoSelect.addEventListener('change', (e) => {
            const helpText = document.getElementById('codigoHelp');
            if (helpText) {
                if (!e.target.value) {
                    helpText.style.display = 'block';
                } else {
                    helpText.style.display = 'none';
                }
            }
            console.log('Código selecionado:', e.target.value);
        });
    }
    
    // Botões principais
    const btnLimpar = document.getElementById('btnLimparJustificativa');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparJustificativa);
    }
    
    const btnSalvar = document.getElementById('btnSalvarJustificativa');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvarJustificativa);
    }
    
    // Botão para abrir planilha de acompanhamento
    const btnAbrirPlanilhaAcompanhamento = document.getElementById('btnAbrirPlanilhaAcompanhamento');
    if (btnAbrirPlanilhaAcompanhamento) {
        btnAbrirPlanilhaAcompanhamento.addEventListener('click', () => {
            const config = carregarConfiguracoes();
            
            if (!config.sheetIdAcompanhamento) {
                mostrarNotificacao('Configure o ID da planilha de acompanhamento primeiro', 'error');
                mudarParaAba('configuracoes');
                return;
            }
            
            const url = `https://docs.google.com/spreadsheets/d/${config.sheetIdAcompanhamento}/edit`;
            console.log('Abrindo planilha de acompanhamento:', url);
            
            window.open(url, '_blank');
            
            mostrarNotificacao('Abrindo sua planilha de acompanhamento...', 'info', 3000);
        });
    }
    
    // Botão de teste
    const btnTeste = document.getElementById('btnTesteJustificativa');
    if (btnTeste) {
        btnTeste.addEventListener('click', () => {
            const codigoSelect = document.getElementById('codigoJustificativa');
            console.log('🔍 Teste - Elemento select:', codigoSelect);
            console.log('🔍 Teste - Valor selecionado:', codigoSelect?.value);
            console.log('🔍 Teste - Opções:', codigoSelect?.options);
            
            // Tenta selecionar um código automaticamente
            if (codigoSelect && codigoSelect.options.length > 1) {
                codigoSelect.value = codigoSelect.options[1].value;
                console.log('✅ Código selecionado automaticamente:', codigoSelect.value);
            }
        });
    }
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
    const horasBrutasEl = document.getElementById('horasBrutas');
    const descontoAlmocoEl = document.getElementById('descontoAlmoco');
    const horasLiquidasEl = document.getElementById('horasLiquidas');
    const textoCalculoEl = document.getElementById('textoCalculo');
    
    if (horasBrutasEl) horasBrutasEl.textContent = horasBrutas;
    if (descontoAlmocoEl) descontoAlmocoEl.textContent = descontoAlmoco;
    if (horasLiquidasEl) horasLiquidasEl.textContent = horasLiquidas;
    if (textoCalculoEl) textoCalculoEl.textContent = textoCalculo;
}

function limparJustificativa() {
    if (confirm('Limpar formulário de justificativa?')) {
        const codigoSelect = document.getElementById('codigoJustificativa');
        const horaInicio = document.getElementById('horaInicioJustificativa');
        const horaFim = document.getElementById('horaFimJustificativa');
        const fezAlmoco = document.getElementById('fezAlmoco');
        const observacao = document.getElementById('observacaoJustificativa');
        
        if (codigoSelect) codigoSelect.value = '';
        if (horaInicio) horaInicio.value = '08:00';
        if (horaFim) horaFim.value = '17:00';
        if (fezAlmoco) fezAlmoco.checked = true;
        if (observacao) observacao.value = '';
        
        calcularHorasJustificativa();
    }
}
// ============================================
// VALIDAÇÃO DO CAMPO OBSERVAÇÃO
// ============================================

function validarObservacao() {
    const campo = document.getElementById('observacaoJustificativa');
    const erro = document.getElementById('obsError');
    
    if (!campo || !erro) return;
    
    // Remove espaços em branco
    const valor = campo.value.trim();
    
    if (valor === '') {
        campo.style.borderColor = 'var(--erro)';
        erro.style.display = 'block';
        return false;
    } else {
        campo.style.borderColor = '';
        erro.style.display = 'none';
        return true;
    }
}

// Validação em tempo real
document.addEventListener('DOMContentLoaded', function() {
    const campoObs = document.getElementById('observacaoJustificativa');
    if (campoObs) {
        campoObs.addEventListener('blur', validarObservacao);
        campoObs.addEventListener('input', validarObservacao);
    }
});
async function salvarJustificativa() {
    try {
        console.log('🔄 Iniciando salvamento de justificativa...');
        
        // Coleta dados COM CHECKS
        const dataJustificativaInput = document.getElementById('dataJustificativa');
        const mesSelect = document.getElementById('selectMesJustificativa');
        const codigoSelect = document.getElementById('codigoJustificativa');
        const horaInicioInput = document.getElementById('horaInicioJustificativa');
        const horaFimInput = document.getElementById('horaFimJustificativa');
        const fezAlmocoCheckbox = document.getElementById('fezAlmoco');
        const observacaoTextarea = document.getElementById('observacaoJustificativa');
        
        console.log('🔍 Elementos encontrados:', {
            dataJustificativa: !!dataJustificativaInput,
            mesSelect: !!mesSelect,
            codigoSelect: !!codigoSelect,
            horaInicio: !!horaInicioInput,
            horaFim: !!horaFimInput,
            fezAlmoco: !!fezAlmocoCheckbox,
            observacao: !!observacaoTextarea
        });
        
        // Validações
        if (!dataJustificativaInput?.value) {
            throw new Error('Informe a data da justificativa');
        }
        
        if (!mesSelect?.value) {
            throw new Error('Selecione o mês');
        }
        // VALIDAÇÃO DA OBSERVAÇÃO (NOVO)
if (!observacaoTextarea?.value || observacaoTextarea.value.trim() === '') {
    // Mostra erro visual
    validarObservacao();
    // Foca no campo
    observacaoTextarea.focus();
    throw new Error('O campo Observação é obrigatório');
}
        // VERIFICAÇÃO ESPECÍFICA DO CÓDIGO
        if (!codigoSelect?.value || codigoSelect.value === '') {
            console.log('❌ Código selecionado:', codigoSelect?.value);
            throw new Error('Selecione um código de justificativa');
        }
        
        if (!horaInicioInput?.value || !horaFimInput?.value) {
            throw new Error('Informe horário início e fim');
        }
        
        // CORREÇÃO CRÍTICA: Extrai dia corretamente da data
        const dataInput = dataJustificativaInput.value; // Formato: YYYY-MM-DD
        console.log('📅 Data input (YYYY-MM-DD):', dataInput);
        
        // Divide a string "YYYY-MM-DD"
        const partes = dataInput.split('-');
        
        if (partes.length !== 3) {
            throw new Error('Formato de data inválido. Use DD/MM/AAAA');
        }
        
        const ano = parseInt(partes[0]);
        const mesNumero = parseInt(partes[1]); // 1-12
        const dia = parseInt(partes[2]); // 1-31
        
        console.log('📅 Partes extraídas:', { ano, mesNumero, dia });
        
        // Valida o dia
        if (dia < 1 || dia > 31) {
            throw new Error('Dia inválido. Deve ser entre 1 e 31');
        }
        
        // Verifica se o mês selecionado corresponde ao mês da data
        const mesesNumeros = {
            'JANEIRO': 1, 'FEVEREIRO': 2, 'MARÇO': 3, 'ABRIL': 4,
            'MAIO': 5, 'JUNHO': 6, 'JULHO': 7, 'AGOSTO': 8,
            'SETEMBRO': 9, 'OUTUBRO': 10, 'NOVEMBRO': 11, 'DEZEMBRO': 12
        };
        
        const mesSelecionado = mesSelect.value;
        const mesNumeroSelecionado = mesesNumeros[mesSelecionado];
        
        console.log('📅 Comparação mês:', {
            mesSelecionado,
            mesNumeroSelecionado,
            mesNumeroData: mesNumero
        });
        
        // Aviso se meses não coincidem (mas não impede o salvamento)
        if (mesNumeroSelecionado !== mesNumero) {
            console.warn('⚠️ Atenção: O mês da data não corresponde ao mês selecionado');
            if (!confirm(`Atenção: A data é ${dia}/${mesNumero}/${ano} mas você selecionou o mês ${mesSelecionado}. Deseja continuar?`)) {
                return { success: false, message: 'Operação cancelada pelo usuário' };
            }
        }
        
        // Calcula horas líquidas
        calcularHorasJustificativa();
        const horasLiquidas = document.getElementById('horasLiquidas')?.textContent || "00:00";
        
        // Prepara dados para envio
        const dados = {
            tipo: 'justificativa',
            data: dataInput, // Envia como YYYY-MM-DD
            dataJustificativa: dataInput, // Campo adicional para o Apps Script
            mes: mesSelecionado,
            dia: dia, // Envia o dia como número (1-31)
            codigo: codigoSelect.value,
            horaInicio: horaInicioInput.value,
            horaFim: horaFimInput.value,
            fezAlmoco: fezAlmocoCheckbox?.checked || false,
            horasLiquidas: horasLiquidas,
            observacao: observacaoTextarea?.value || ''
        };
        
        console.log('📦 Dados preparados para envio:', dados);
        
        // Desabilita botão durante envio
        const btn = document.getElementById('btnSalvarJustificativa');
        const textoOriginal = btn?.innerHTML;
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            btn.disabled = true;
        }
        
        // Envia para API
        console.log('📤 Enviando para API...');
        const resultado = await salvarJustificativaAPI(dados);
        
        console.log('📥 Resultado da API:', resultado);
        
        // Reabilita botão
        if (btn) {
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
        }
        
        if (resultado && resultado.success) {
            console.log('✅ Sucesso! Mostrando notificação...');
            mostrarNotificacao('Justificativa salva com sucesso!', 'success');
            limparJustificativa();
            atualizarEstatisticas();
        } else {
            const erroMsg = resultado?.error || resultado?.message || 'Erro desconhecido';
            console.log('❌ Erro da API:', erroMsg);
            mostrarNotificacao(`Erro: ${erroMsg}`, 'error');
        }
        
        return resultado;
        
    } catch (error) {
        console.error('❌ Erro ao salvar justificativa:', error);
        
        // Reabilita botão em caso de erro
        const btn = document.getElementById('btnSalvarJustificativa');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-save"></i> Salvar Justificativa';
            btn.disabled = false;
        }
        
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
        return { 
            success: false, 
            error: error.message,
            message: error.message 
        };
    }
}

async function salvarJustificativaAPI(dados) {
    try {
        console.log('📤 Iniciando envio de justificativa para API...');
        console.log('📦 Dados recebidos:', dados);
        
        // Carrega configurações do usuário
        const config = carregarConfiguracoes();
        console.log('⚙️ Configurações carregadas:', config);
        
        if (!config.sheetIdFrequencia || !config.sheetIdAcompanhamento) {
            throw new Error('Configure ambas as planilhas');
        }
        
        // Verifica se a função enviarParaAppsScript está disponível
        if (typeof enviarParaAppsScript === 'undefined') {
            console.error('❌ FUNÇÃO CRÍTICA NÃO DISPONÍVEL: enviarParaAppsScript');
            throw new Error('Função de envio não disponível');
        }
        
        console.log('✅ Função enviarParaAppsScript disponível');
        
        // Prepara dados para envio - usando saveJustificativaCompleta
        const dadosEnvio = {
            operation: 'saveJustificativaCompleta',
            sheetIdFrequencia: config.sheetIdFrequencia,
            sheetIdAcompanhamento: config.sheetIdAcompanhamento,
            month: dados.mes.toUpperCase(),
            day: dados.dia,
            dataJustificativa: dados.data,
            codigo: dados.codigo,
            horaInicio: formatarHora(dados.horaInicio) || '08:00',
            horaFim: formatarHora(dados.horaFim) || '17:00',
            fezAlmoco: dados.fezAlmoco || false,
            horasLiquidas: dados.horasLiquidas || '08:00',
            observacao: dados.observacao || '',
            timestamp: new Date().toISOString()
        };
        
        console.log('📤 Dados para envio:', dadosEnvio);
        
        // Envia para o Apps Script
        const resultado = await enviarParaAppsScript(dadosEnvio);
        
        console.log('📥 Resultado do envio:', resultado);
        
        return resultado;
        
    } catch (error) {
        console.error('❌ Erro ao salvar justificativa:', error);
        return {
            success: false,
            error: error.message
        };
    }
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
                <button class="btn btn-primary btn-block mt-3" onclick="window.mudarParaAba ? mudarParaAba('configuracoes') : console.log('Função não disponível')">
                    <i class="fas fa-cog"></i>
                    Ir para Configurações
                </button>
            </div>
        </div>
    `;
}

// Exportar funções
if (typeof window !== 'undefined') {
    window.initAcompanhamento = initAcompanhamento;
}
