// LÓGICA PRINCIPAL DO APLICATIVO

// Estado global do aplicativo
const AppState = {
    abaAtual: 'frequencia',
    instaladoComoPWA: false,
    online: navigator.onLine,
    carregando: false
};
function mudarParaAba(aba) {
    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach(btn => {
        if (btn.dataset.tab === aba) {
            btn.click();
        }
    });
}
/**
 * Inicializa o aplicativo
 */
function initApp() {
    console.log('🚀 Inicializando Controle de Frequência...');
    setTimeout(esconderSplashScreen, 2000);
    
    // Configura data atual no cabeçalho
    atualizarDataAtual();
    
    // Configura navegação por abas
    configurarNavegacaoAbas();
    
    // Configura event listeners globais
    configurarEventListenersGlobais();
    
    // Inicializa a aba atual
    inicializarAbaAtual();
    
    // Verifica se está instalado como PWA
    verificarInstalacaoPWA();
    
    // Configura verificação de conexão
    configurarVerificacaoConexao();
    
    // Sincroniza backups pendentes em segundo plano
    setTimeout(() => {
        if (typeof sincronizarBackupsPendentes === 'function') {
            sincronizarBackupsPendentes();
        }
    }, 3000);
    
    console.log('✅ Aplicativo inicializado com sucesso!');
    
    // Mostra mensagem de boas-vindas
    setTimeout(() => {
        mostrarBoasVindas();
    }, 1000);
}

/**
 * Atualiza a data atual no cabeçalho
 */
function atualizarDataAtual() {
    const currentDate = document.getElementById('currentDate');
    if (!currentDate) return;
    
    const hoje = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const dataFormatada = hoje.toLocaleDateString('pt-BR', options);
    currentDate.textContent = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
    
    // Atualiza a cada minuto (para mudança de dia)
    setTimeout(atualizarDataAtual, 60000);
}

/**
 * Configura a navegação por abas
 */
function configurarNavegacaoAbas() {
    const botoes = document.querySelectorAll('.tab-btn');
    
    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            const abaAlvo = botao.dataset.tab;
            
            // Atualiza botões ativos
            botoes.forEach(b => b.classList.remove('active'));
            botao.classList.add('active');
            
            // Atualiza abas visíveis
            const abas = document.querySelectorAll('.tab-pane');
            abas.forEach(aba => aba.classList.remove('active'));
            
            const abaSelecionada = document.getElementById(abaAlvo);
            if (abaSelecionada) {
                abaSelecionada.classList.add('active');
                AppState.abaAtual = abaAlvo;
                
                // Inicializa a aba selecionada
                inicializarAba(abaAlvo);
            }
            
            // Anima a transição
            if (abaSelecionada) {
                abaSelecionada.style.animation = 'none';
                setTimeout(() => {
                    abaSelecionada.style.animation = 'fadeIn 0.3s ease';
                }, 10);
            }
        });
    });
}

/**
 * Inicializa a aba atual
 */
function inicializarAbaAtual() {
    inicializarAba(AppState.abaAtual);
}

/**
 * Inicializa uma aba específica
 */
function inicializarAba(aba) {
    // Remove conteúdo de carregamento
    const container = document.getElementById(aba);
    if (!container) return;
    
    const loading = container.querySelector('.loading');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => {
            if (loading.parentNode) {
                loading.remove();
            }
        }, 300);
    }
    
    // Inicializa a aba específica
    switch(aba) {
        case 'frequencia':
            if (typeof initFrequencia === 'function') {
                AppState.carregando = true;
                setTimeout(() => {
                    initFrequencia();
                    AppState.carregando = false;
                }, 100);
            }
            break;
            
        case 'acompanhamento':
            if (typeof initAcompanhamento === 'function') {
                AppState.carregando = true;
                setTimeout(() => {
                    initAcompanhamento();
                    AppState.carregando = false;
                }, 100);
            }
            break;
            
        case 'configuracoes':
            if (typeof initConfiguracoes === 'function') {
                AppState.carregando = true;
                setTimeout(() => {
                    initConfiguracoes();
                    AppState.carregando = false;
                }, 100);
            }
            break;
    }
}

/**
 * Configura event listeners globais
 */
function configurarEventListenersGlobais() {
    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        // Ctrl+1,2,3 para alternar entre abas
        if (e.ctrlKey && e.key >= '1' && e.key <= '3') {
            const index = parseInt(e.key) - 1;
            const botoes = document.querySelectorAll('.tab-btn');
            if (botoes[index]) {
                e.preventDefault();
                botoes[index].click();
            }
        }
        
        // ESC para fechar modal
        if (e.key === 'Escape') {
            fecharModal();
            esconderNotificacao();
        }
    });
    
    // Verifica antes de fechar a página
    window.addEventListener('beforeunload', (e) => {
        // Pode adicionar lógica para salvar dados pendentes
        // Por enquanto, apenas avisa se estiver carregando
        if (AppState.carregando) {
            e.preventDefault();
            e.returnValue = 'Há operações em andamento. Tem certeza que deseja sair?';
        }
    });
    
    // Observa mudanças no tamanho da tela
    window.addEventListener('resize', debounce(() => {
        // Pode adicionar ajustes responsivos aqui
        console.log('Tela redimensionada:', window.innerWidth, 'x', window.innerHeight);
    }, 250));
}

/**
 * Verifica se o app está instalado como PWA
 */
function verificarInstalacaoPWA() {
    // Verifica se está em modo standalone (PWA instalado)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        AppState.instaladoComoPWA = true;
        console.log('📱 Aplicativo instalado como PWA');
        
        // Pode adicionar comportamentos específicos para PWA aqui
        document.body.classList.add('pwa-installed');
    }
}

/**
 * Configura verificação de conexão
 */
function configurarVerificacaoConexao() {
    // Atualiza status inicial
    AppState.online = navigator.onLine;
    atualizarStatusConexao();
    
    // Escuta mudanças na conexão
    window.addEventListener('online', () => {
        AppState.online = true;
        atualizarStatusConexao();
        mostrarNotificacao('Conexão restaurada!', 'success');
        
        // Tenta sincronizar backups pendentes
        if (typeof sincronizarBackupsPendentes === 'function') {
            setTimeout(sincronizarBackupsPendentes, 1000);
        }
    });
    
    window.addEventListener('offline', () => {
        AppState.online = false;
        atualizarStatusConexao();
        mostrarNotificacao('Você está offline. Os dados serão salvos localmente.', 'warning', 5000);
    });
}

/**
 * Atualiza status da conexão na interface
 */
function atualizarStatusConexao() {
    // Atualiza badge na aba configurações se existir
    const badgeConexao = document.getElementById('badgeConexao');
    if (badgeConexao) {
        if (AppState.online) {
            badgeConexao.textContent = '✓ Online';
            badgeConexao.className = 'status-badge success';
        } else {
            badgeConexao.textContent = '✗ Offline';
            badgeConexao.className = 'status-badge error';
        }
    }
    
    // Adiciona/remove classe no body para estilos CSS
    if (AppState.online) {
        document.body.classList.remove('offline');
        document.body.classList.add('online');
    } else {
        document.body.classList.remove('online');
        document.body.classList.add('offline');
    }
}

/**
 * Mostra mensagem de boas-vindas
 */
function mostrarBoasVindas() {
    // Verifica se é a primeira vez
    const jaViu = localStorage.getItem('primeira_vez');
    
    if (!jaViu) {
        // Mostra modal de boas-vindas
        const conteudo = `
            <div class="text-center">
                <div class="welcome-icon mb-3">
                    <i class="fas fa-calendar-check fa-3x" style="color: var(--verde-musgo);"></i>
                </div>
                <h3 class="mb-3">Bem-vindo ao Controle de Frequência!</h3>
                <p class="mb-3">Para começar a usar o aplicativo:</p>
                <ol class="text-left mb-3">
                    <li>Vá para a aba <strong>Configurações</strong></li>
                    <li>Clique nos botões para abrir os templates</li>
                    <li>Faça cópias das planilhas para seu Drive</li>
                    <li>Cole os IDs das suas cópias no aplicativo</li>
                </ol>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <small>Você pode instalar este aplicativo no seu celular ou computador para uso offline.</small>
                </div>
            </div>
        `;
        
        mostrarModal(
            'Bem-vindo! 👋',
            conteudo,
            `
                <button class="btn btn-primary" onclick="fecharModal(); localStorage.setItem('primeira_vez', 'true');">
                    <i class="fas fa-play-circle"></i>
                    Vamos Começar!
                </button>
            `
        );
    } else {
        // Verifica se as configurações estão completas
        const config = verificarConfiguracoesMinimas();
        
        if (!config.todasConfiguradas) {
            setTimeout(() => {
                mostrarNotificacao(
                    'Configure suas planilhas na aba Configurações para começar a usar.',
                    'info',
                    8000
                );
            }, 2000);
        }
    }
}

/**
 * Instala o aplicativo como PWA
 */
function instalarPWA() {
    // Isso geralmente é acionado pelo browser automaticamente
    // Mas podemos mostrar um prompt personalizado
    
    // Verifica se o evento beforeinstallprompt foi capturado
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Previne o prompt automático
        e.preventDefault();
        deferredPrompt = e;
        
        // Mostra botão de instalação
        mostrarPromptInstalacao();
    });
    
    function mostrarPromptInstalacao() {
        if (!deferredPrompt) return;
        
        const conteudo = `
            <div class="text-center">
                <i class="fas fa-download fa-3x mb-3" style="color: var(--verde-musgo);"></i>
                <h4 class="mb-3">Instalar Aplicativo</h4>
                <p>Instale o Controle de Frequência para usar offline e ter acesso rápido!</p>
                <div class="alert alert-success mt-3">
                    <i class="fas fa-mobile-alt"></i>
                    <small>Disponível para celular e computador</small>
                </div>
            </div>
        `;
        
        mostrarModal(
            'Instalar App 📱',
            conteudo,
            `
                <button class="btn btn-secondary" onclick="fecharModal()">
                    Agora Não
                </button>
                <button class="btn btn-primary" onclick="triggerInstall()">
                    <i class="fas fa-download"></i>
                    Instalar
                </button>
            `
        );
        
        window.triggerInstall = async () => {
            if (!deferredPrompt) return;
            
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            console.log(`Resultado da instalação: ${outcome}`);
            deferredPrompt = null;
            
            fecharModal();
            
            if (outcome === 'accepted') {
                mostrarNotificacao('Aplicativo instalado com sucesso!', 'success');
            }
        };
    }
}

/**
 * Verifica atualizações do Service Worker
 */
function verificarAtualizacoes() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.update().then(() => {
                console.log('Service Worker verificado para atualizações');
            });
        });
    }
}

/**
 * Mostra informações sobre o aplicativo
 */
function mostrarSobre() {
    const conteudo = `
        <div class="text-center">
            <div class="mb-3">
                <i class="fas fa-calendar-check fa-3x" style="color: var(--verde-musgo);"></i>
            </div>
            <h3 class="mb-3">Controle de Frequência</h3>
            <p class="mb-3">Aplicativo para gestão de horários e justificativas</p>
            
            <div class="text-left">
                <div class="info-item mb-2">
                    <strong>Versão:</strong> 1.0.0
                </div>
                <div class="info-item mb-2">
                    <strong>Desenvolvido por:</strong> Suporte Técnico
                </div>
                <div class="info-item mb-2">
                    <strong>Tecnologias:</strong> PWA, Google Apps Script, JavaScript
                </div>
                <div class="info-item mb-3">
                    <strong>Licença:</strong> Uso pessoal
                </div>
            </div>
            
            <div class="alert alert-info">
                <i class="fas fa-shield-alt"></i>
                <small>Este aplicativo funciona totalmente no seu navegador. 
                Seus dados são salvos diretamente nas SUAS planilhas do Google.</small>
            </div>
        </div>
    `;
    
    mostrarModal('Sobre o Aplicativo', conteudo);
}

/**
 * Alterna tema claro/escuro (futura implementação)
 */
function alternarTema() {
    const temaAtual = document.body.getAttribute('data-theme') || 'light';
    const novoTema = temaAtual === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', novoTema);
    localStorage.setItem('tema', novoTema);
    
    mostrarNotificacao(`Tema ${novoTema === 'dark' ? 'escuro' : 'claro'} ativado`, 'success');
}

/**
 * Carrega tema salvo
 */
function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem('tema') || 'light';
    document.body.setAttribute('data-theme', temaSalvo);
}

// Funções globais para acesso via HTML
window.mostrarNotificacao = mostrarNotificacao;
window.esconderNotificacao = esconderNotificacao;
window.fecharModal = fecharModal;
window.mudarParaAba = mudarParaAba;

/**
 * Inicializa o app quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', () => {
    // Já mostra a splash screen imediatamente
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.classList.remove('hidden');
    }
    
    // Carrega tema salvo
    carregarTemaSalvo();
    
    // Inicializa o app
    initApp();
    
    // Configura intervalo para verificar atualizações (a cada 1 hora)
    setInterval(verificarAtualizacoes, 60 * 60 * 1000);
});
/**
 * Lida com erros globais não capturados
 */
window.addEventListener('error', (event) => {
    console.error('Erro global:', event.error);
    
    // Mostra erro amigável ao usuário
    if (event.error && event.error.message) {
        mostrarNotificacao(
            `Ocorreu um erro: ${event.error.message}. 
            Recarregue a página ou entre em contato com o suporte.`,
            'error',
            10000
        );
    }
});

/**
 * Lida com promessas rejeitadas não capturadas
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promessa rejeitada não capturada:', event.reason);
    
    mostrarNotificacao(
        'Ocorreu um erro inesperado. Algumas funcionalidades podem não estar disponíveis.',
        'error',
        8000
    );
});
// ============================================
// CORREÇÃO: REMOVE MENSAGENS "CARREGANDO..."
// ============================================

function removerMensagensCarregando() {
    console.log('🔧 Removendo mensagens de carregamento...');
    
    // Remove de TODAS as abas imediatamente
    const loadings = document.querySelectorAll('.tab-pane .loading');
    console.log('📊 Encontrados', loadings.length, 'elementos loading');
    
    loadings.forEach((loading, index) => {
        console.log(`🗑️ Removendo loading ${index + 1}`);
        loading.style.opacity = '0';
        loading.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            if (loading.parentNode) {
                loading.remove();
                console.log(`✅ Loading ${index + 1} removido`);
            }
        }, 300);
    });
    
    // Se ainda houver conteúdo "carregando..." em texto
    document.querySelectorAll('.tab-pane').forEach(aba => {
        const texto = aba.textContent || '';
        if (texto.includes('carregando') || texto.includes('Carregando')) {
            console.log('📝 Limpando texto "carregando" da aba:', aba.id);
            aba.innerHTML = '<div class="card"><p>Aguarde, conteúdo carregando...</p></div>';
        }
    });
}
/**
 * Esconde a splash screen com animação
 */
function esconderSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        // Adiciona classe para animação de fade out
        splash.classList.add('fade-out');
        
        // Remove completamente após animação
        setTimeout(() => {
            splash.classList.add('hidden');
            
            // Remove do DOM após 1 segundo para garantir
            setTimeout(() => {
                if (splash.parentNode) {
                    splash.remove();
                }
            }, 1000);
        }, 500); // Espera meio segundo para a animação
    }
}

/**
 * Fallback: Esconde splash se algo der errado
 */
function esconderSplashScreenFallback() {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.classList.add('hidden');
        setTimeout(() => {
            if (splash.parentNode) {
                splash.remove();
            }
        }, 1000);
    }
}

// Fallback de segurança: esconde splash após 5 segundos
setTimeout(esconderSplashScreenFallback, 5000);

// Executa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', removerMensagensCarregando);

// Executa após 3 segundos (fallback)
setTimeout(removerMensagensCarregando, 3000);

// Executa quando muda de aba
document.querySelectorAll('.tab-btn').forEach(botao => {
    botao.addEventListener('click', function() {
        setTimeout(removerMensagensCarregando, 500);
    });
});

console.log('✅ Sistema de remoção de loading instalado');
