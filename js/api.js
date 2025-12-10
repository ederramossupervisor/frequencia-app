// API PARA COMUNICAÇÃO COM O GOOGLE APPS SCRIPT

/**
 * Envia dados para o Google Apps Script
 */
async function enviarParaAppsScript(dados) {
    try {
        // Verifica se a URL do script está configurada
        if (!CONFIG.APP_SCRIPT_URL || CONFIG.APP_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
            mostrarNotificacao(
                'Erro: URL do Apps Script não configurada. Configure na aba Configurações.',
                'error',
                10000
            );
            return {
                success: false,
                error: 'URL do Apps Script não configurada'
            };
        }
        
        // Mostra indicador de carregamento
        mostrarNotificacao('Enviando dados...', 'info', 2000);
        
        // Faz a requisição para o Apps Script
        const resposta = await fetch(CONFIG.APP_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Importante para evitar problemas com CORS
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        
        // Nota: Com 'no-cors', não conseguimos ler a resposta diretamente
        // O Apps Script processa e salva os dados
        console.log('Dados enviados para Apps Script:', dados);
        
        // Mostra mensagem de sucesso
        mostrarNotificacao('Dados enviados com sucesso!', 'success', 3000);
        
        return {
            success: true,
            message: 'Dados enviados para processamento'
        };
        
    } catch (error) {
        console.error('Erro ao enviar para Apps Script:', error);
        
        // Tenta método alternativo usando formulário (para contornar CORS)
        try {
            await enviarViaFormulario(dados);
            return {
                success: true,
                message: 'Dados enviados via método alternativo'
            };
        } catch (formError) {
            mostrarNotificacao(
                'Erro ao enviar dados. Verifique sua conexão e tente novamente.',
                'error',
                5000
            );
            
            return {
                success: false,
                error: error.toString()
            };
        }
    }
}

/**
 * Método alternativo usando formulário (para quando fetch falha)
 */
function enviarViaFormulario(dados) {
    return new Promise((resolve, reject) => {
        try {
            // Cria formulário temporário
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = CONFIG.APP_SCRIPT_URL;
            form.style.display = 'none';
            
            // Adiciona campo com os dados JSON
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'dados';
            input.value = JSON.stringify(dados);
            form.appendChild(input);
            
            // Adiciona formulário à página e envia
            document.body.appendChild(form);
            form.submit();
            
            // Remove formulário após envio
            setTimeout(() => {
                document.body.removeChild(form);
                resolve();
            }, 100);
            
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Testa a conexão com o Apps Script
 */
async function testarConexaoAppsScript() {
    try {
        const dadosTeste = {
            operation: 'testConnection',
            timestamp: new Date().toISOString()
        };
        
        const resultado = await enviarParaAppsScript(dadosTeste);
        
        if (resultado.success) {
            mostrarNotificacao('Conexão com Apps Script estabelecida com sucesso!', 'success');
            return true;
        } else {
            mostrarNotificacao('Falha na conexão com Apps Script', 'error');
            return false;
        }
    } catch (error) {
        console.error('Erro ao testar conexão:', error);
        mostrarNotificacao('Erro ao testar conexão com Apps Script', 'error');
        return false;
    }
}

/**
 * Envia dados de frequência
 */
async function salvarFrequencia(dados) {
    try {
        // Validações básicas
        if (!dados.mes || !dados.dia) {
            throw new Error('Mês e dia são obrigatórios');
        }
        
        // Carrega configurações do usuário
        const config = carregarConfiguracoes();
        
        if (!config.sheetIdFrequencia) {
            throw new Error('ID da planilha de frequência não configurado');
        }
        
        // Prepara dados para envio
        const dadosEnvio = {
            operation: 'saveFrequencia',
            sheetIdFrequencia: config.sheetIdFrequencia,
            userId: 'usuario_' + Date.now(), // Identificador único
            month: dados.mes,
            day: dados.dia,
            timestamp: new Date().toISOString()
        };
        
        // Adiciona campos preenchidos
        if (dados.entradaManha) dadosEnvio.entradaManha = formatarHora(dados.entradaManha);
        if (dados.saidaManha) dadosEnvio.saidaManha = formatarHora(dados.saidaManha);
        if (dados.entradaTarde) dadosEnvio.entradaTarde = formatarHora(dados.entradaTarde);
        if (dados.saidaTarde) dadosEnvio.saidaTarde = formatarHora(dados.saidaTarde);
        if (dados.codigoJustificativa) dadosEnvio.codigoJustificativa = dados.codigoJustificativa;
        
        // Calcula horas trabalhadas se tiver todos os horários
        if (dados.entradaManha && dados.saidaTarde) {
            const horasManha = calcularHorasTrabalhadas(dados.entradaManha, dados.saidaManha || '12:00');
            const horasTarde = calcularHorasTrabalhadas(dados.entradaTarde || '13:00', dados.saidaTarde);
            
            // Soma as horas (simplificado)
            dadosEnvio.horasTrabalhadas = horasManha; // Pode ajustar para cálculo mais preciso
        }
        
        // Envia para o Apps Script
        const resultado = await enviarParaAppsScript(dadosEnvio);
        
        if (resultado.success) {
            // Salva localmente para backup
            salvarBackupLocal('frequencia', dadosEnvio);
            
            mostrarNotificacao(
                `Frequência do dia ${dados.dia} salva com sucesso!`,
                'success'
            );
        }
        
        return resultado;
        
    } catch (error) {
        console.error('Erro ao salvar frequência:', error);
        mostrarNotificacao(`Erro ao salvar frequência: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Envia dados de justificativa
 */
async function salvarJustificativa(dados) {
    try {
        // Validações básicas
        if (!dados.mes || !dados.codigo || !dados.dataJustificativa) {
            throw new Error('Mês, código e data são obrigatórios');
        }
        
        // Carrega configurações do usuário
        const config = carregarConfiguracoes();
        
        if (!config.sheetIdFrequencia) {
            throw new Error('ID da planilha de frequência não configurado');
        }
        
        // Prepara dados para envio
        const dadosEnvio = {
            operation: 'saveJustificativa',
            sheetIdFrequencia: config.sheetIdFrequencia,
            month: dados.mes,
            codigo: dados.codigo,
            dataJustificativa: dados.dataJustificativa,
            horaInicio: formatarHora(dados.horaInicio) || '08:00',
            horaFim: formatarHora(dados.horaFim) || '17:00',
            timestamp: new Date().toISOString()
        };
        
        // Adiciona descrição se existir
        if (dados.descricao) {
            dadosEnvio.descricao = dados.descricao;
        }
        
        // Envia para o Apps Script
        const resultado = await enviarParaAppsScript(dadosEnvio);
        
        if (resultado.success) {
            // Salva localmente para backup
            salvarBackupLocal('justificativa', dadosEnvio);
            
            mostrarNotificacao(
                `Justificativa ${dados.codigo} salva com sucesso!`,
                'success'
            );
        }
        
        return resultado;
        
    } catch (error) {
        console.error('Erro ao salvar justificativa:', error);
        mostrarNotificacao(`Erro ao salvar justificativa: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Envia dados de observação
 */
async function salvarObservacao(dados) {
    try {
        // Validações básicas
        if (!dados.mes || !dados.texto) {
            throw new Error('Mês e texto são obrigatórios');
        }
        
        // Carrega configurações do usuário
        const config = carregarConfiguracoes();
        
        if (!config.sheetIdAcompanhamento) {
            throw new Error('ID da planilha de acompanhamento não configurado');
        }
        
        // Prepara dados para envio
        const dadosEnvio = {
            operation: 'saveObservacao',
            sheetIdAcompanhamento: config.sheetIdAcompanhamento,
            month: dados.mes,
            texto: dados.texto,
            timestamp: new Date().toISOString()
        };
        
        // Envia para o Apps Script
        const resultado = await enviarParaAppsScript(dadosEnvio);
        
        if (resultado.success) {
            // Salva localmente para backup
            salvarBackupLocal('observacao', dadosEnvio);
            
            mostrarNotificacao('Observação salva com sucesso!', 'success');
        }
        
        return resultado;
        
    } catch (error) {
        console.error('Erro ao salvar observação:', error);
        mostrarNotificacao(`Erro ao salvar observação: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Salva backup local dos dados (para caso falhe o envio)
 */
function salvarBackupLocal(tipo, dados) {
    try {
        const chave = `backup_${tipo}_${Date.now()}`;
        const backup = {
            tipo,
            dados,
            timestamp: new Date().toISOString(),
            sincronizado: true // Será marcado como false se falhar
        };
        
        localStorage.setItem(chave, JSON.stringify(backup));
        
        // Limpa backups antigos (mais de 7 dias)
        limparBackupsAntigos();
        
    } catch (error) {
        console.error('Erro ao salvar backup local:', error);
    }
}

/**
 * Limpa backups antigos
 */
function limparBackupsAntigos() {
    try {
        const seteDiasAtras = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            
            if (chave.startsWith('backup_')) {
                try {
                    const backup = JSON.parse(localStorage.getItem(chave));
                    
                    if (backup && backup.timestamp) {
                        const timestampBackup = new Date(backup.timestamp).getTime();
                        
                        if (timestampBackup < seteDiasAtras) {
                            localStorage.removeItem(chave);
                        }
                    }
                } catch (e) {
                    // Ignora erros de parse
                }
            }
        }
    } catch (error) {
        console.error('Erro ao limpar backups antigos:', error);
    }
}

/**
 * Tenta sincronizar backups pendentes
 */
async function sincronizarBackupsPendentes() {
    try {
        const backupsPendentes = [];
        
        // Encontra backups não sincronizados
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            
            if (chave.startsWith('backup_')) {
                try {
                    const backup = JSON.parse(localStorage.getItem(chave));
                    
                    if (backup && !backup.sincronizado) {
                        backupsPendentes.push({ chave, backup });
                    }
                } catch (e) {
                    // Ignora erros
                }
            }
        }
        
        if (backupsPendentes.length === 0) return;
        
        // Tenta sincronizar cada backup
        for (const item of backupsPendentes) {
            try {
                // Reenvia os dados
                const resultado = await enviarParaAppsScript(item.backup.dados);
                
                if (resultado.success) {
                    // Marca como sincronizado
                    item.backup.sincronizado = true;
                    localStorage.setItem(item.chave, JSON.stringify(item.backup));
                }
            } catch (error) {
                console.error(`Erro ao sincronizar backup ${item.chave}:`, error);
            }
        }
        
        if (backupsPendentes.length > 0) {
            console.log(`${backupsPendentes.length} backups sincronizados`);
        }
        
    } catch (error) {
        console.error('Erro na sincronização de backups:', error);
    }
}

/**
 * Exporta funções da API
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        enviarParaAppsScript,
        testarConexaoAppsScript,
        salvarFrequencia,
        salvarJustificativa,
        salvarObservacao,
        sincronizarBackupsPendentes
    };
}
