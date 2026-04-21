const fs = require('fs');
const path = require('path');

/**
 * Lê e retorna o conteúdo de um arquivo JSON.
 * Se o arquivo não existir, retorna um array vazio ou o valor padrão fornecido.
 */
function readJson(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Erro ao ler o arquivo ${filePath}:`, error);
        return [];
    }
}

/**
 * Sobrescreve o arquivo JSON com os dados fornecidos.
 * Garante que o diretório pai exista antes de escrever.
 */
function writeJson(filePath, data) {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const content = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.error(`Erro ao escrever no arquivo ${filePath}:`, error);
        return false;
    }
}

module.exports = {
    readJson,
    writeJson
};
