// FUNÇÕES UTILITÁRIAS DO APLICATIVO

/**
 * Formata data no formato brasileiro (dd/mm/aaaa)
 */
function formatarData(data) {
    const d = new Date(data);
    // Ajusta para fuso horário de Brasília
    const offset = d.getTimezoneOffset();
    d.setMinutes(d.getMinutes() + offset);
    
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    
    return `${dia}/${mes}/${ano}`;
}

/**
 * Formata hora no formato 00:00
 */
function formatarHora(horaString) {
    if (!horaString) return '';
    
    // Remove espaços e caracteres especiais
    const horaLimpa = horaString.replace(/[^\d:]/g, '');
    
    // Se já estiver no formato correto, retorna
    if (/^\d{1,2}:\d{2}$/.test(horaLimpa)) {
        const [horas, minutos] = horaLimpa.split(':');
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    }
    
    // Se for apenas números (ex: 800 para 08:00)
    if (/^\d{3,4}$/.test(horaLimpa)) {
        const hora = horaLimpa.padStart(4, '0');
        return `${hora.substring(0, 2)}:${hora.substring(2, 4)}`;
    }
    
    return '';
}

/**
 * Calcula horas trabalhadas
 */
function calcularHorasTrabalhadas(entrada, saida, almoco = "01:00") {
    if (!entrada || !saida) return "00:00";
    
    const [entHora, entMin] = entrada.split(':').map(Number);
    const [saiHora, saiMin] = saida.split(':').map(Number);
    const [almHora, almMin] = almoco.split(':').map(Number);
    
    let totalMinutos = (saiHora * 60 + saiMin) - (entHora * 60 + entMin);
    totalMinutos -= (almHora * 60 + almMin);
    
    if (totalMinutos < 0) totalMinutos = 0;
    
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

/**
 * Extrai ID da planilha da URL do Google Sheets
 */
function extrairIdPlanilha(url) {
    if (!url) return '';
    
    // Padrões de URL do Google Sheets
    const padroes = [
        /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
        /\/d\/([a-zA-Z0-9-_]+)\//,
        /id=([a-zA-Z0-9-_]+)/,
        /^([a-zA-Z0-9-_]+)$/
    ];
    
    for (const padrao of padroes) {
        const match = url.match(padrao);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return url.trim();
}

/**
 * Valida se um ID parece ser um ID válido do Google Sheets
 */
function validarIdPlanilha(id) {
    return id && /^[a-zA-Z0-9-_]{44}$/.test(id);
}

/**
 * Mostra notificação na tela
 */
function mostrarNotificacao(mensagem, tipo = 'info', duracao = 5000) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) return;
    
    // Remove classes anteriores
    notification.classList.remove('success', 'error', 'warning');
    
    // Adiciona classe do tipo
    notification.classList.add(tipo);
    
    // Define texto
    notificationText.textContent = mensagem;
    
    // Mostra notificação
    notification.classList.remove('hidden');
    
    // Esconde automaticamente após duração
    if (duracao > 0) {
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duracao);
    }
}

/**
 * Esconde notificação manualmente
 */
function esconderNotificacao() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.add('hidden');
    }
}

/**
 * Mostra modal genérico
 */
function mostrarModal(titulo, corpoHtml, rodapeHtml = '') {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');
    
    if (!modal || !modalTitle || !modalBody || !modalFooter) return;
    
    modalTitle.textContent = titulo;
    modalBody.innerHTML = corpoHtml;
    modalFooter.innerHTML = rodapeHtml;
    
    modal.classList.remove('hidden');
    
    // Retorna função para fechar modal
    return () => modal.classList.add('hidden');
}

/**
 * Fecha modal
 */
function fecharModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Carrega dados do localStorage
 */
function carregarConfiguracoes() {
    try {
        const config = {
            sheetIdFrequencia: localStorage.getItem(CONFIG.STORAGE_KEYS.FREQUENCIA_SHEET_ID) || '',
            sheetIdAcompanhamento: localStorage.getItem(CONFIG.STORAGE_KEYS.ACOMPANHAMENTO_SHEET_ID) || ''
        };
        
        return config;
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        return {
            sheetIdFrequencia: '',
            sheetIdAcompanhamento: ''
        };
    }
}

/**
 * Salva dados no localStorage
 */
function salvarConfiguracoes(config) {
    try {
        if (config.sheetIdFrequencia) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.FREQUENCIA_SHEET_ID, config.sheetIdFrequencia);
        }
        
        if (config.sheetIdAcompanhamento) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.ACOMPANHAMENTO_SHEET_ID, config.sheetIdAcompanhamento);
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        return false;
    }
}

/**
 * Limpa dados do localStorage
 */
function limparConfiguracoes() {
    try {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.FREQUENCIA_SHEET_ID);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ACOMPANHAMENTO_SHEET_ID);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_SETTINGS);
        return true;
    } catch (error) {
        console.error('Erro ao limpar configurações:', error);
        return false;
    }
}

/**
 * Verifica se as configurações mínimas estão preenchidas
 */
function verificarConfiguracoesMinimas() {
    const config = carregarConfiguracoes();
    return {
        frequenciaConfigurada: !!config.sheetIdFrequencia,
        acompanhamentoConfigurado: !!config.sheetIdAcompanhamento,
        todasConfiguradas: !!config.sheetIdFrequencia && !!config.sheetIdAcompanhamento
    };
}

/**
 * Obtém mês atual em português (ex: "JANEIRO")
 */
function obterMesAtual() {
    const meses = CONFIG.MESES;
    const data = new Date();
    // Ajusta para fuso horário de Brasília
    const offset = data.getTimezoneOffset();
    data.setMinutes(data.getMinutes() + offset);
    
    return meses[data.getMonth()];
}

/**
 * Obtém dia atual
 */
function obterDiaAtual() {
    const data = new Date();
    // Ajusta para fuso horário de Brasília
    const offset = data.getTimezoneOffset();
    data.setMinutes(data.getMinutes() + offset);
    
    return data.getDate();
}

/**
 * Cria elemento HTML de forma segura
 */
function criarElemento(tag, atributos = {}, conteudo = '') {
    const elemento = document.createElement(tag);
    
    // Define atributos
    Object.keys(atributos).forEach(key => {
        if (key === 'className') {
            elemento.className = atributos[key];
        } else if (key === 'htmlFor') {
            elemento.htmlFor = atributos[key];
        } else {
            elemento.setAttribute(key, atributos[key]);
        }
    });
    
    // Define conteúdo (texto ou HTML)
    if (typeof conteudo === 'string') {
        elemento.innerHTML = conteudo;
    } else if (conteudo instanceof Node) {
        elemento.appendChild(conteudo);
    } else if (Array.isArray(conteudo)) {
        conteudo.forEach(item => {
            if (item instanceof Node) {
                elemento.appendChild(item);
            } else {
                elemento.innerHTML += item;
            }
        });
    }
    
    return elemento;
}

/**
 * Desabilita/enabilita elemento
 */
function toggleElemento(elemento, desabilitar) {
    if (!elemento) return;
    
    if (desabilitar) {
        elemento.setAttribute('disabled', 'true');
        elemento.style.opacity = '0.6';
        elemento.style.cursor = 'not-allowed';
    } else {
        elemento.removeAttribute('disabled');
        elemento.style.opacity = '1';
        elemento.style.cursor = '';
    }
}

/**
 * Debounce para otimizar chamadas de função
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Formata horas para exibição amigável
 */
function formatarHorasAmigavel(horas) {
    if (!horas || horas === "00:00") return "0 horas";
    
    const [h, m] = horas.split(':').map(Number);
    
    if (h === 0) {
        return `${m} minutos`;
    } else if (m === 0) {
        return `${h} hora${h > 1 ? 's' : ''}`;
    } else {
        return `${h} hora${h > 1 ? 's' : ''} e ${m} minutos`;
    }
}
