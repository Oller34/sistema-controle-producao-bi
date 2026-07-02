// Variável global para guardar a lista completa de profissionais que vem do banco
let listaProfissionaisCompleta = [];

// Assim que a página carregar por completo, busca os profissionais lá no banco de dados
document.addEventListener("DOMContentLoaded", function() {
    carregarProfissionaisDoBanco();
});

// Função que puxa os profissionais via API
function carregarProfissionaisDoBanco() {
    fetch('api/get_profissionais.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta do servidor: ' + response.status);
            }
            return response.json();
        })
        .then(dados => {
            if (dados.erro) {
                console.error("Erro retornado pelo PHP:", dados.erro);
            } else {
                listaProfissionaisCompleta = Array.isArray(dados) ? dados : [];
                console.log("Profissionais carregados com sucesso do MySQL:", listaProfissionaisCompleta);
            }
        })
        .catch(error => {
            console.error("Erro crítico no fetch de profissionais:", error);
        });
}

// Função executada quando o usuário escolhe o CARGO
function filtrarProfissionaisPorCargo() {
    const cargoSelecionado = document.getElementById('cargo').value;
    const selectProfissional = document.getElementById('profissional');
    const selectTipo = document.getElementById('tipo');

    // Limpa os campos de baixo com uma opção padrão única
    selectProfissional.innerHTML = '<option value="">Selecione o profissional...</option>';
    selectProfissional.disabled = true;
    selectTipo.innerHTML = '<option value="">Selecione o profissional primeiro...</option>';
    selectTipo.disabled = true;

    if (!cargoSelecionado) return;

    // Filtra na nossa lista em memória apenas os profissionais do cargo selecionado
    const profissionaisFiltrados = listaProfissionaisCompleta.filter(p => p.cargo === cargoSelecionado);

    if (profissionaisFiltrados.length === 0) {
        selectProfissional.innerHTML = '<option value="">Nenhum profissional encontrado para este cargo</option>';
        return;
    }

    // Alimenta o select com os profissionais reais vindos do banco
    profissionaisFiltrados.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id_profissional; 
        option.textContent = p.nome_profissional;
        selectProfissional.appendChild(option);
    });

    // Libera o campo com o valor padrão definido
    selectProfissional.disabled = false;
    selectProfissional.value = "";
}

// Função executada quando escolhe o PROFISSIONAL para aplicar as Regras de Negócio
function liberarEFiltrarAtendimentos() {
    const cargo = document.getElementById('cargo').value;
    const selectTipo = document.getElementById('tipo');

    if (!document.getElementById('profissional').value) {
        selectTipo.disabled = true;
        return;
    }

    // Recria a lista padrão de atendimentos limpa
    selectTipo.innerHTML = `
        <option value="">Selecione o tipo...</option>
        <option value="1">Consulta - Primeira Vez</option>
        <option value="2">Consulta - Agendada</option>
        <option value="3">Consulta - Pré Natal</option>
        <option value="4">Visita Domiciliar</option>
        <option value="5">Papanicolau</option>
    `;
    selectTipo.disabled = false;

    // Aplica as Regras de Negócio removendo o que não pertence ao cargo
    for (let i = selectTipo.options.length - 1; i >= 0; i--) {
        const option = selectTipo.options[i];
        if (option.value === "") continue;

        const idAtendimento = option.value;

        if (cargo === 'Médico' || cargo === 'Enfermeiro') {
            if (idAtendimento === '5') option.remove(); 
        } else if (cargo === 'Técnico de Enfermagem') {
            if (idAtendimento !== '4' && idAtendimento !== '5') option.remove();
        } else if (cargo === 'Dentista') {
            if (idAtendimento !== '4') option.remove();
        }
    }
}

// Envia os dados estruturados em JSON para o adicionar_producao.php
function salvarProducao() {
    const dados = {
        data_atendimento: document.getElementById('data').value,
        id_profissional: document.getElementById('profissional').value,
        id_tipo_atendimento: document.getElementById('tipo').value,
        quantidade: document.getElementById('quantidade').value,
        status_atendimento: document.getElementById('status').value 
    };

    // Validação de segurança completa
    if (!dados.data_atendimento || !dados.id_profissional || !dados.id_tipo_atendimento || !dados.quantidade || !dados.status_atendimento) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    fetch('api/adicionar_producao.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(res => {
        alert(res.mensagem);
        if (res.sucesso) {
            // Reseta a tela inteira de forma limpa para o próximo lançamento
            document.getElementById('cargo').value = '';
            filtrarProfissionaisPorCargo(); 
            document.getElementById('quantidade').value = '1';
            document.getElementById('data').value = '';
            document.getElementById('status').value = 'Realizado'; 
        }
    })
    .catch(error => {
        console.error('Erro no Fetch ao salvar:', error);
        alert("Erro ao salvar a produção.");
    });
}