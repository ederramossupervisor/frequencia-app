// LÓGICA DA ABA ACOMPANHAMENTO

// Variáveis globais da aba acompanhamento
let acompanhamentoState = {
    mesAtual: '',
    observacoes: []
};

/**
 * Inicializa a aba de acompanhamento
 */
function initAcompanhamento() {
    console.log('Inicializando aba Acompanhamento...');
    
    // Atualiza estado
    acompanhamentoState.mesAtual = obterMesAtual();
    
    // Carrega interface
    carregarInterfaceAcompanhamento();
    
    // Carrega observações salvas
    carregarObservacoesSalvas();
    
    // Configura event listeners
    configurarEventListenersAcompanhamento();
    
    console.log('Aba Acompanhamento inicializada');
}

/**
 * Carrega a interface da aba acompanhamento
 */
function carregarInterfaceAcompanhamento() {
    const container = document.getElementById('acompanhamento');
    
    if (!container) {
        console.error('Container da aba acompanhamento não encontrado');
        return;
    }
    
    // Verifica se as configurações mínimas estão preenchidas
    const config = verificarConfiguracoesMinimas();
    
    if (!config.acompanhamentoConfigurado) {
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Configuração Necessária</h2>
                </div>
                <div class="card-body">
                    <div class="alert warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Para usar a aba de Acompanhamento, você precisa configurar o ID da sua planilha.</p>
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
    
    // Interface principal do acompanhamento
    container.innerHTML = `
        <div class="grid grid-2">
            <!-- Painel de Observações -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-sticky-note"></i>
                        Nova Observação
                    </h2>
                    <span class="badge badge-info" id="contadorObservacoes">
                        0 observações
                    </span>
                </div>
                <div class="card-body">
                    <!-- Seletor de Mês -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-calendar-alt"></i>
                            Mês de Referência
                        </label>
                        <select class="form-control" id="selectMesAcompanhamento">
                            ${CONFIG.MESES.map(mes => 
                                `<option value="${mes}" ${mes === acompanhamentoState.mesAtual ? 'selected' : ''}>
                                    ${mes}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <!-- Campo de Observação -->
                    <div class="form-group">
                        <label class="form-label" for="textoObservacao">
                            <i class="fas fa-edit"></i>
                            Observação / Justificativa
                        </label>
                        <textarea 
                            class="form-control" 
                            id="textoObservacao"
                            rows="6"
                            placeholder="Descreva aqui sua observação, justificativa ou qualquer informação relevante..."
                            maxlength="500"
                        ></textarea>
                        <div class="d-flex justify-content-between mt-1">
                            <small class="form-text">
                                <span id="contadorCaracteres">0</span>/500 caracteres
                            </small>
                            <button class="btn btn-sm btn-secondary" id="btnLimparTexto">
                                <i class="fas fa-eraser"></i>
                                Limpar
                            </button>
                        </div>
                    </div>
                    
                    <!-- Exemplos -->
                    <div class="card mt-3">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-lightbulb"></i>
                                Exemplos de Observações
                            </h3>
                            <button class="btn btn-sm btn-secondary" id="btnToggleExemplos">
                                <i class="fas fa-eye"></i>
                                Mostrar
                            </button>
                        </div>
                        <div class="card-body" id="exemplosObservacoes" style="display: none;">
                            <ul class="list-unstyled">
                                <li class="mb-2">
                                    <small class="text-muted">Viagem:</small><br>
                                    <code>Viagem para Vitória-ES para reunião com cliente X.</code>
                                </li>
                                <li class="mb-2">
                                    <small class="text-muted">Treinamento:</small><br>
                                    <code>Participação em curso de capacitação sobre nova legislação.</code>
                                </li>
                                <li class="mb-2">
                                    <small class="text-muted">Serviço externo:</small><br>
                                    <code>Atendimento em campo para instalação de equipamentos.</code>
                                </li>
                                <li>
                                    <small class="text-muted">Outros:</small><br>
                                    <code>Compensação de horas extraordinárias realizadas no dia XX.</code>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Botões de Ação -->
                    <div class="grid grid-2 gap-2 mt-4">
                        <button class="btn btn-secondary" id="btnCancelarObservacao">
                            <i class="fas fa-times"></i>
                            Cancelar
                        </button>
                        <button class="btn btn-primary" id="btnSalvarObservacao">
                            <i class="fas fa-save"></i>
                            Salvar Observação
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Painel de Visualização -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-list"></i>
                        Observações do Mês
                    </h2>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-secondary" id="btnFiltrarObservacoes">
                            <i class="fas fa-filter"></i>
                            Filtrar
                        </button>
                        <button class="btn btn-sm btn-success" id="btnExportarObservacoes">
                            <i class="fas fa-download"></i>
                            Exportar
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Filtros -->
                    <div class="mb-3" id="filtrosObservacoes" style="display: none;">
                        <div class="grid grid-3 gap-2">
                            <input type="text" class="form-control" placeholder="Buscar texto..." id="filtroTexto">
                            <input type="date" class="form-control" id="filtroData">
                            <button class="btn btn-sm btn-secondary" id="btnLimparFiltros">
                                <i class="fas fa-times"></i>
                                Limpar
                            </button>
                        </div>
                    </div>
                    
                    <!-- Lista de Observações -->
                    <div class="observacoes-container" id="containerObservacoes">
                        <div class="text-center p-4">
                            <i class="fas fa-sticky-note fa-2x text-muted"></i>
                            <p class="mt-2">Nenhuma observação salva ainda</p>
                            <small class="text-muted">As observações salvas aparecerão aqui</small>
                        </div>
                    </div>
                    
                    <!-- Estatísticas -->
                    <div class="card mt-3">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-chart-bar"></i>
                                Estatísticas do Mês
                            </h3>
                        </div>
                        <div class="card-body">
                            <div class="grid grid-3 text-center">
                                <div>
                                    <div class="stat-number" id="totalObservacoes">0</div>
                                    <small class="text-muted">Total</small>
                                </div>
                                <div>
                                    <div class="stat-number" id="obsEsteMes">0</div>
                                    <small class="text-muted">Este mês</small>
                                </div>
                                <div>
                                    <div class="stat-number" id="obsUltimaSemana">0</div>
                                    <small class="text-muted">Última semana</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Painel de Instruções -->
        <div class="card mt-3">
            <div class="card-header">
                <h2 class="card-title">
                    <i class="fas fa-question-circle"></i>
                    Como Funciona o Acompanhamento
                </h2>
                <button class="btn btn-sm btn-secondary" id="btnToggleInstrucoes">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="card-body" id="instrucoesAcompanhamento">
                <div class="grid grid-3">
                    <div class="text-center p-3">
                        <div class="icon-instruction mb-2">
                            <i class="fas fa-edit fa-2x text-success"></i>
                        </div>
                        <h4>1. Escreva</h4>
                        <p>Descreva sua observação de forma clara e objetiva.</p>
                    </div>
                    <div class="text-center p-3">
                        <div class="icon-instruction mb-2">
                            <i class="fas fa-calendar-check fa-2x text-primary"></i>
                        </div>
                        <h4>2. Selecione o Mês</h4>
                        <p>Escolha o mês de referência para a observação.</p>
                    </div>
                    <div class="text-center p-3">
                        <div class="icon-instruction mb-2">
                            <i class="fas fa-paper-plane fa-2x text-info"></i>
                        </div>
                        <h4>3. Salve</h4>
                        <p>Clique em salvar para registrar na planilha.</p>
                    </div>
                </div>
                
                <div class="alert alert-info mt-3">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <strong>Importante:</strong>
                        <p>As observações são salvas no intervalo A38:J45 da planilha de acompanhamento, 
                        no formato "DD/MM/AAAA - texto da observação".</p>
                        <p>Se o intervalo estiver cheio, uma nova linha será criada automaticamente.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Atualiza contador de caracteres
    atualizarContadorCaracteres();
}

/**
 * Configura os event listeners da aba acompanhamento
 */
function configurarEventListenersAcompanhamento() {
    // Seletor de mês
    const selectMes = document.getElementById('selectMesAcompanhamento');
    if (selectMes) {
        selectMes.addEventListener('change', (e) => {
            acompanhamentoState.mesAtual = e.target.value;
            console.log('Mês alterado para:', acompanhamentoState.mesAtual);
            carregarObservacoesSalvas();
        });
    }
    
    // Campo de texto (contador de caracteres)
    const textoObservacao = document.getElementById('textoObservacao');
    if (textoObservacao) {
        textoObservacao.addEventListener('input', atualizarContadorCaracteres);
        textoObservacao.addEventListener('keydown', (e) => {
            // Atalho Ctrl+Enter para salvar
            if (e.ctrlKey && e.key === 'Enter') {
                salvarObservacaoAtual();
            }
        });
    }
    
    // Botão limpar texto
    const btnLimparTexto = document.getElementById('btnLimparTexto');
    if (btnLimparTexto) {
        btnLimparTexto.addEventListener('click', () => {
            const campo = document.getElementById('textoObservacao');
            if (campo) {
                campo.value = '';
                atualizarContadorCaracteres();
                campo.focus();
            }
        });
    }
    
    // Botão mostrar/ocultar exemplos
    const btnToggleExemplos = document.getElementById('btnToggleExemplos');
    if (btnToggleExemplos) {
        btnToggleExemplos.addEventListener('click', () => {
            const exemplos = document.getElementById('exemplosObservacoes');
            if (exemplos) {
                const visivel = exemplos.style.display !== 'none';
                exemplos.style.display = visivel ? 'none' : 'block';
                btnToggleExemplos.innerHTML = visivel ? 
                    '<i class="fas fa-eye"></i> Mostrar' : 
                    '<i class="fas fa-eye-slash"></i> Ocultar';
            }
        });
    }
    
    // Botão salvar observação
    const btnSalvarObservacao = document.getElementById('btnSalvarObservacao');
    if (btnSalvarObservacao) {
        btnSalvarObservacao.addEventListener('click', salvarObservacaoAtual);
    }
    
    // Botão cancelar observação
    const btnCancelarObservacao = document.getElementById('btnCancelarObservacao');
    if (btnCancelarObservacao) {
        btnCancelarObservacao.addEventListener('click', () => {
            const campo = document.getElementById('textoObservacao');
            if (campo && campo.value.trim() !== '') {
                if (confirm('Deseja cancelar e limpar a observação atual?')) {
                    campo.value = '';
                    atualizarContadorCaracteres();
                }
            }
        });
    }
    
    // Botão filtrar observações
    const btnFiltrarObservacoes = document.getElementById('btnFiltrarObservacoes');
    if (btnFiltrarObservacoes) {
        btnFiltrarObservacoes.addEventListener('click', () => {
            const filtros = document.getElementById('filtrosObservacoes');
            if (filtros) {
                const visivel = filtros.style.display !== 'none';
                filtros.style.display = visivel ? 'none' : 'block';
                btnFiltrarObservacoes.innerHTML = visivel ? 
                    '<i class="fas fa-filter"></i> Filtrar' : 
                    '<i class="fas fa-filter"></i> Ocultar';
            }
        });
    }
    
    // Botão exportar observações
    const btnExportarObservacoes = document.getElementById('btnExportarObservacoes');
    if (btnExportarObservacoes) {
        btnExportarObservacoes.addEventListener('click', exportarObservacoes);
    }
    
    // Botão limpar filtros
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', () => {
            const filtroTexto = document.getElementById('filtroTexto');
            const filtroData = document.getElementById('filtroData');
            
            if (filtroTexto) filtroTexto.value = '';
            if (filtroData) filtroData.value = '';
            
            carregarObservacoesSalvas();
        });
    }
    
    // Botão mostrar/ocultar instruções
    const btnToggleInstrucoes = document.getElementById('btnToggleInstrucoes');
    if (btnToggleInstrucoes) {
        btnToggleInstrucoes.addEventListener('click', () => {
            const instrucoes = document.getElementById('instrucoesAcompanhamento');
            if (instrucoes) {
                const visivel = instrucoes.style.display !== 'none';
                instrucoes.style.display = visivel ? 'none' : 'block';
                btnToggleInstrucoes.innerHTML = visivel ? 
                    '<i class="fas fa-chevron-down"></i>' : 
                    '<i class="fas fa-chevron-up"></i>';
            }
        });
    }
    
    // Configura filtros em tempo real
    const filtroTexto = document.getElementById('filtroTexto');
    if (filtroTexto) {
        filtroTexto.addEventListener('input', debounce(() => {
            aplicarFiltrosObservacoes();
        }, 500));
    }
    
    const filtroData = document.getElementById('filtroData');
    if (filtroData) {
        filtroData.addEventListener('change', () => {
            aplicarFiltrosObservacoes();
        });
    }
}

/**
 * Atualiza contador de caracteres
 */
function atualizarContadorCaracteres() {
    const campo = document.getElementById('textoObservacao');
    const contador = document.getElementById('contadorCaracteres');
    
    if (!campo || !contador) return;
    
    const comprimento = campo.value.length;
    contador.textContent = comprimento;
    
    // Altera cor conforme limite se aproxima
    if (comprimento > 450) {
        contador.style.color = 'var(--erro)';
        contador.style.fontWeight = 'bold';
    } else if (comprimento > 400) {
        contador.style.color = 'var(--alerta)';
    } else {
        contador.style.color = '';
        contador.style.fontWeight = '';
    }
}

/**
 * Carrega observações salvas
 */
function carregarObservacoesSalvas() {
    // Por enquanto, carrega do localStorage
    // Futuramente pode carregar da planilha
    
    try {
        const chave = `observacoes_${acompanhamentoState.mesAtual}`;
        const dados = localStorage.getItem(chave);
        
        if (dados) {
            acompanhamentoState.observacoes = JSON.parse(dados);
        } else {
            acompanhamentoState.observacoes = [];
        }
        
        // Atualiza interface
        renderizarObservacoes();
        atualizarEstatisticas();
        
    } catch (error) {
        console.error('Erro ao carregar observações:', error);
        acompanhamentoState.observacoes = [];
    }
}

/**
 * Renderiza observações na tela
 */
function renderizarObservacoes() {
    const container = document.getElementById('containerObservacoes');
    if (!container) return;
    
    if (acompanhamentoState.observacoes.length === 0) {
        container.innerHTML = `
            <div class="text-center p-4">
                <i class="fas fa-sticky-note fa-2x text-muted"></i>
                <p class="mt-2">Nenhuma observação salva ainda para ${acompanhamentoState.mesAtual}</p>
                <small class="text-muted">As observações salvas aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    // Ordena por data (mais recente primeiro)
    const observacoesOrdenadas = [...acompanhamentoState.observacoes].sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
    });
    
    // Aplica filtros se existirem
    let observacoesFiltradas = observacoesOrdenadas;
    const filtroTexto = document.getElementById('filtroTexto')?.value.toLowerCase();
    const filtroData = document.getElementById('filtroData')?.value;
    
    if (filtroTexto) {
        observacoesFiltradas = observacoesFiltradas.filter(obs => 
            obs.texto.toLowerCase().includes(filtroTexto)
        );
    }
    
    if (filtroData) {
        const dataFiltro = new Date(filtroData);
        observacoesFiltradas = observacoesFiltradas.filter(obs => {
            const dataObs = new Date(obs.data);
            return dataObs.toDateString() === dataFiltro.toDateString();
        });
    }
    
    // Renderiza
    let html = '';
    
    observacoesFiltradas.forEach((obs, index) => {
        const dataFormatada = formatarData(obs.data);
        const textoLimitado = obs.texto.length > 150 ? 
            obs.texto.substring(0, 150) + '...' : obs.texto;
        
        html += `
            <div class="observacao-item ${index > 0 ? 'mt-3' : ''}">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas fa-calendar-day"></i>
                                <strong>${dataFormatada}</strong>
                                <small class="text-muted ms-2">${obs.mes}</small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-secondary" onclick="editarObservacao(${index})" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="excluirObservacao(${index})" title="Excluir">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <p>${textoLimitado.replace(/\n/g, '<br>')}</p>
                        ${obs.texto.length > 150 ? 
                            `<small class="text-muted">${obs.texto.length} caracteres</small>` : ''}
                    </div>
                    <div class="card-footer">
                        <small class="text-muted">
                            <i class="fas fa-clock"></i>
                            Salvo em: ${new Date(obs.timestamp).toLocaleTimeString('pt-BR')}
                        </small>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Atualiza contador
    const contadorObservacoes = document.getElementById('contadorObservacoes');
    if (contadorObservacoes) {
        contadorObservacoes.textContent = `${observacoesFiltradas.length} observações`;
        
        if (observacoesFiltradas.length < observacoesOrdenadas.length) {
            contadorObservacoes.classList.add('badge-warning');
        } else {
            contadorObservacoes.classList.remove('badge-warning');
        }
    }
}

/**
 * Aplica filtros às observações
 */
function aplicarFiltrosObservacoes() {
    renderizarObservacoes();
}

/**
 * Atualiza estatísticas
 */
function atualizarEstatisticas() {
    const totalObservacoes = document.getElementById('totalObservacoes');
    const obsEsteMes = document.getElementById('obsEsteMes');
    const obsUltimaSemana = document.getElementById('obsUltimaSemana');
    
    if (!totalObservacoes || !obsEsteMes || !obsUltimaSemana) return;
    
    // Calcula totais
    let totalGeral = 0;
    let totalEsteMes = 0;
    let totalUltimaSemana = 0;
    
    const hoje = new Date();
    const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    const mesAtualNumero = hoje.getMonth() + 1;
    
    // Percorre todos os meses no localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        
        if (chave.startsWith('observacoes_')) {
            try {
                const observacoes = JSON.parse(localStorage.getItem(chave));
                totalGeral += observacoes.length;
                
                // Conta observações deste mês
                if (chave === `observacoes_${acompanhamentoState.mesAtual}`) {
                    totalEsteMes = observacoes.length;
                    
                    // Conta observações da última semana
                    observacoes.forEach(obs => {
                        const dataObs = new Date(obs.timestamp);
                        if (dataObs >= umaSemanaAtras) {
                            totalUltimaSemana++;
                        }
                    });
                }
            } catch (e) {
                // Ignora erros
            }
        }
    }
    
    totalObservacoes.textContent = totalGeral;
    obsEsteMes.textContent = totalEsteMes;
    obsUltimaSemana.textContent = totalUltimaSemana;
}

/**
 * Salva observação atual
 */
async function salvarObservacaoAtual() {
    try {
        // Validações
        const mes = document.getElementById('selectMesAcompanhamento')?.value;
        const texto = document.getElementById('textoObservacao')?.value.trim();
        
        if (!mes) {
            throw new Error('Selecione um mês');
        }
        
        if (!texto || texto.length === 0) {
            throw new Error('Digite uma observação');
        }
        
        if (texto.length > 500) {
            throw new Error('A observação deve ter no máximo 500 caracteres');
        }
        
        // Prepara dados
        const dados = {
            mes: mes,
            texto: texto,
            data: new Date().toISOString()
        };
        
        // Desabilita botão durante o envio
        const btnSalvar = document.getElementById('btnSalvarObservacao');
        const textoOriginal = btnSalvar?.innerHTML;
        if (btnSalvar) {
            btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            btnSalvar.disabled = true;
        }
        
        // Salva localmente (para backup)
        salvarObservacaoLocal(dados);
        
        // Envia para a planilha via API
        const resultado = await salvarObservacao({
            mes: mes,
            texto: texto
        });
        
        // Reabilita botão
        if (btnSalvar) {
            btnSalvar.innerHTML = textoOriginal;
            btnSalvar.disabled = false;
        }
        
        // Se sucesso, limpa campo e atualiza lista
        if (resultado.success) {
            const campoTexto = document.getElementById('textoObservacao');
            if (campoTexto) {
                campoTexto.value = '';
                atualizarContadorCaracteres();
            }
            
            mostrarNotificacao('Observação salva com sucesso!', 'success');
            carregarObservacoesSalvas();
        }
        
        return resultado;
        
    } catch (error) {
        console.error('Erro ao salvar observação:', error);
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}

/**
 * Salva observação localmente
 */
function salvarObservacaoLocal(dados) {
    try {
        const chave = `observacoes_${dados.mes}`;
        let observacoes = [];
        
        // Carrega observações existentes
        const dadosSalvos = localStorage.getItem(chave);
        if (dadosSalvos) {
            observacoes = JSON.parse(dadosSalvos);
        }
        
        // Adiciona nova observação
        const novaObservacao = {
            ...dados,
            timestamp: new Date().toISOString(),
            id: Date.now() + Math.random().toString(36).substr(2, 9)
        };
        
        observacoes.push(novaObservacao);
        
        // Salva de volta
        localStorage.setItem(chave, JSON.stringify(observacoes));
        
        // Atualiza estado
        acompanhamentoState.observacoes = observacoes;
        
        return true;
        
    } catch (error) {
        console.error('Erro ao salvar observação local:', error);
        return false;
    }
}

/**
 * Edita observação
 */
function editarObservacao(index) {
    try {
        const observacao = acompanhamentoState.observacoes[index];
        if (!observacao) return;
        
        const campoTexto = document.getElementById('textoObservacao');
        const selectMes = document.getElementById('selectMesAcompanhamento');
        
        if (campoTexto && selectMes) {
            campoTexto.value = observacao.texto;
            selectMes.value = observacao.mes;
            
            atualizarContadorCaracteres();
            
            // Rola para o topo do formulário
            campoTexto.scrollIntoView({ behavior: 'smooth' });
            campoTexto.focus();
            
            // Atualiza botão para "Atualizar"
            const btnSalvar = document.getElementById('btnSalvarObservacao');
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
                btnSalvar.onclick = () => atualizarObservacao(index);
            }
            
            mostrarNotificacao('Observação carregada para edição', 'info');
        }
        
    } catch (error) {
        console.error('Erro ao editar observação:', error);
        mostrarNotificacao('Erro ao carregar observação para edição', 'error');
    }
}

/**
 * Atualiza observação existente
 */
async function atualizarObservacao(index) {
    try {
        const mes = document.getElementById('selectMesAcompanhamento')?.value;
        const texto = document.getElementById('textoObservacao')?.value.trim();
        
        if (!mes || !texto) {
            throw new Error('Preencha todos os campos');
        }
        
        // Atualiza localmente
        acompanhamentoState.observacoes[index] = {
            ...acompanhamentoState.observacoes[index],
            mes: mes,
            texto: texto,
            timestamp: new Date().toISOString()
        };
        
        // Salva no localStorage
        localStorage.setItem(
            `observacoes_${mes}`,
            JSON.stringify(acompanhamentoState.observacoes)
        );
        
        // Envia para a planilha (como nova observação, pois não temos função de update)
        await salvarObservacao({ mes, texto });
        
        // Restaura botão original
        const btnSalvar = document.getElementById('btnSalvarObservacao');
        if (btnSalvar) {
            btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar Observação';
            btnSalvar.onclick = salvarObservacaoAtual;
        }
        
        // Limpa campo
        const campoTexto = document.getElementById('textoObservacao');
        if (campoTexto) {
            campoTexto.value = '';
            atualizarContadorCaracteres();
        }
        
        mostrarNotificacao('Observação atualizada com sucesso!', 'success');
        carregarObservacoesSalvas();
        
    } catch (error) {
        console.error('Erro ao atualizar observação:', error);
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
    }
}

/**
 * Exclui observação
 */
function excluirObservacao(index) {
    try {
        if (!confirm('Tem certeza que deseja excluir esta observação?')) {
            return;
        }
        
        const observacao = acompanhamentoState.observacoes[index];
        if (!observacao) return;
        
        // Remove do array
        acompanhamentoState.observacoes.splice(index, 1);
        
        // Salva no localStorage
        localStorage.setItem(
            `observacoes_${observacao.mes}`,
            JSON.stringify(acompanhamentoState.observacoes)
        );
        
        mostrarNotificacao('Observação excluída com sucesso', 'success');
        carregarObservacoesSalvas();
        
    } catch (error) {
        console.error('Erro ao excluir observação:', error);
        mostrarNotificacao('Erro ao excluir observação', 'error');
    }
}

/**
 * Exporta observações
 */
function exportarObservacoes() {
    try {
        if (acompanhamentoState.observacoes.length === 0) {
            mostrarNotificacao('Nenhuma observação para exportar', 'warning');
            return;
        }
        
        // Cria conteúdo CSV
        let csv = 'Data,Mês,Observação\n';
        
        acompanhamentoState.observacoes.forEach(obs => {
            const dataFormatada = formatarData(obs.data);
            const textoEscapado = obs.texto.replace(/"/g, '""').replace(/\n/g, ' ');
            csv += `"${dataFormatada}","${obs.mes}","${textoEscapado}"\n`;
        });
        
        // Cria blob e link para download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.setAttribute('download', `observacoes_${acompanhamentoState.mesAtual}_${formatarData(new Date()).replace(/\//g, '-')}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        mostrarNotificacao('Observações exportadas com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao exportar observações:', error);
        mostrarNotificacao('Erro ao exportar observações', 'error');
    }
}

/**
 * Adiciona estilos CSS para estatísticas
 */
function adicionarEstilosEstatisticas() {
    const style = document.createElement('style');
    style.textContent = `
        .stat-number {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--verde-musgo);
        }
        .icon-instruction {
            color: var(--verde-musgo);
            opacity: 0.8;
        }
        .observacao-item {
            transition: all 0.3s ease;
        }
        .observacao-item:hover {
            transform: translateX(5px);
        }
    `;
    document.head.appendChild(style);
}

// Inicializa estilos quando o script carrega
adicionarEstilosEstatisticas();
