// Adicione estas funções ao arquivo api.js:

async function salvarFrequenciaAPI(dados) {
    try {
        const config = carregarConfiguracoes();
        
        if (!config.sheetIdFrequencia) {
            throw new Error('ID da planilha de frequência não configurado');
        }
        
        const dadosEnvio = {
            operation: 'saveFrequencia',
            sheetIdFrequencia: config.sheetIdFrequencia,
            month: dados.mes,
            day: dados.dia,
            entradaManha: dados.entradaManha,
            saidaManha: dados.saidaManha,
            entradaTarde: dados.entradaTarde,
            saidaTarde: dados.saidaTarde,
            timestamp: new Date().toISOString()
        };
        
        const resultado = await enviarParaAppsScript(dadosEnvio);
        
        if (resultado.success) {
            salvarBackupLocal('frequencia', dadosEnvio);
        }
        
        return resultado;
        
    } catch (error) {
        console.error('Erro em salvarFrequenciaAPI:', error);
        return { success: false, error: error.message };
    }
}

async function salvarJustificativaAPI(dados) {
    try {
        const config = carregarConfiguracoes();
        
        if (!config.sheetIdFrequencia || !config.sheetIdAcompanhamento) {
            throw new Error('Configure ambas as planilhas');
        }
        
        const dadosEnvio = {
            operation: 'saveJustificativaCompleta',
            sheetIdFrequencia: config.sheetIdFrequencia,
            sheetIdAcompanhamento: config.sheetIdAcompanhamento,
            month: dados.mes,
            day: dados.dia,
            dataJustificativa: dados.data,
            codigo: dados.codigo,
            horaInicio: dados.horaInicio,
            horaFim: dados.horaFim,
            fezAlmoco: dados.fezAlmoco,
            horasLiquidas: dados.horasLiquidas,
            observacao: dados.observacao,
            timestamp: new Date().toISOString()
        };
        
        const resultado = await enviarParaAppsScript(dadosEnvio);
        
        if (resultado.success) {
            salvarBackupLocal('justificativa', dadosEnvio);
        }
        
        return resultado;
        
    } catch (error) {
        console.error('Erro em salvarJustificativaAPI:', error);
        return { success: false, error: error.message };
    }
}

// Adicione ao final do arquivo api.js:
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // ... outras exportações existentes
        salvarFrequenciaAPI,
        salvarJustificativaAPI
    };
}

// Torne as funções globais
window.salvarFrequenciaAPI = salvarFrequenciaAPI;
window.salvarJustificativaAPI = salvarJustificativaAPI;
