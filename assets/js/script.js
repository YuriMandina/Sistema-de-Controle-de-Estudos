/* ==========================================================================
   CONFIGURAÇÕES INICIAIS E VARIÁVEIS GLOBAIS
   ========================================================================== */

// Pegando os elementos do HTML que vou precisar manipular com o JS
const formCadastro = document.getElementById('form-disciplina');
const gradeDisciplinas = document.getElementById('grade-disciplinas');
const modal = document.getElementById('modal-cadastro');
const inputIdEdicao = document.getElementById('id-disciplina');
const inputBusca = document.getElementById('input-busca');
const checkboxTema = document.getElementById('checkbox-tema');
const btnNovo = document.getElementById('btn-novo');

// Tenta carregar os dados salvos no navegador, se não tiver nada (primeiro acesso), cria um array vazio
let listaDisciplinas = JSON.parse(localStorage.getItem('banco_estudos')) || [];


/* ==========================================================================
   GERENCIAMENTO DAS DISCIPLINAS (CRUD)
   ========================================================================== */

// Essa função salva o nosso array de matérias "dentro" do navegador pra não perder ao dar F5
function salvarNoBanco() {
    localStorage.setItem('banco_estudos', JSON.stringify(listaDisciplinas));
}

// Escuta o envio do formulário (tanto pra cadastro novo quanto pra edição)
formCadastro.addEventListener('submit', function(evento) {
    evento.preventDefault(); // Impede a página de recarregar e perder os dados

    const nome = document.getElementById('nome').value;
    const professor = document.getElementById('professor').value;
    const cargaTotal = Number(document.getElementById('carga').value);
    const area = document.getElementById('area').value;
    const idEdicao = inputIdEdicao.value;

    if (idEdicao != '') {
        // Lógica de Edição: procura a matéria pelo ID e atualiza os campos
        for (let i = 0; i < listaDisciplinas.length; i++) {
            if (listaDisciplinas[i].id == idEdicao) {
                listaDisciplinas[i].nome = nome;
                listaDisciplinas[i].professor = professor;
                listaDisciplinas[i].cargaTotal = cargaTotal;
                listaDisciplinas[i].area = area;
            }
        }
    } else {
        // Lógica de Cadastro: cria um objeto novo com ID único baseado no tempo (timestamp)
        const novaDisciplina = {
            id: Date.now(), 
            nome: nome,
            professor: professor,
            cargaTotal: cargaTotal,
            area: area,
            horasEstudadas: 0 
        };
        listaDisciplinas.push(novaDisciplina);
    }

    // Limpa tudo e atualiza a tela
    salvarNoBanco();
    modal.close();
    formCadastro.reset();
    inputIdEdicao.value = ''; 
    mostrarNaTela(); 
});

// Função pra apagar a matéria da lista
function deletarDisciplina(id) {
    if (confirm('Tem certeza que quer apagar essa disciplina?')) {
        // O filter cria uma lista nova sem o ID que a gente quer deletar
        listaDisciplinas = listaDisciplinas.filter(d => d.id != id);
        salvarNoBanco();
        mostrarNaTela();
    }
}

// Pega os dados da matéria e joga de volta no formulário pra gente mudar
function editarDisciplina(id) {
    const d = listaDisciplinas.find(d => d.id == id);
    
    inputIdEdicao.value = d.id;
    document.getElementById('nome').value = d.nome;
    document.getElementById('professor').value = d.professor;
    document.getElementById('carga').value = d.cargaTotal;
    document.getElementById('area').value = d.area;

    document.getElementById('titulo-modal').textContent = 'Editar Disciplina';
    modal.showModal();
}

// Lógica de progresso: aumenta 1 hora toda vez que clica no botão do card
function registrarHora(id) {
    const d = listaDisciplinas.find(d => d.id == id);
    if (d.horasEstudadas < d.cargaTotal) {
        d.horasEstudadas++;
        salvarNoBanco();
        mostrarNaTela();
    } else {
        alert('Boa! Você já completou a carga horária dessa matéria!');
    }
}


/* ==========================================================================
   SISTEMA DE BUSCA E FILTRO
   ========================================================================== */

// Fica de olho em cada letra que o usuário digita na barra de busca
if (inputBusca) {
    inputBusca.addEventListener('input', function() {
        mostrarNaTela(); // Redesenha a tela filtrando em tempo real
    });
}


/* ==========================================================================
   RENDERIZAÇÃO (DESENHAR NA TELA)
   ========================================================================== */

// Essa é a função "cérebro" que monta os cards e calcula os totais
function mostrarNaTela() {
    gradeDisciplinas.innerHTML = ''; // Limpa a grade pra não duplicar tudo
    
    // Pega o que foi digitado na busca (em minúsculo pra não dar erro de diferença)
    const termoBusca = inputBusca ? inputBusca.value.toLowerCase() : '';

    // Filtra a lista principal baseado no nome da matéria
    const listaFiltrada = listaDisciplinas.filter(function(disciplina) {
        return disciplina.nome.toLowerCase().includes(termoBusca);
    });

    // Se não tiver nada pra mostrar, exibe aquela mensagem de "lista vazia"
    const divListaVazia = document.getElementById('lista-vazia');
    if (listaFiltrada.length === 0) {
        divListaVazia.classList.remove('escondido');
    } else {
        divListaVazia.classList.add('escondido');
    }

    // Calcula o total de horas de TODAS as matérias pro cabeçalho
    let totalHoras = 0;
    for (let j = 0; j < listaDisciplinas.length; j++) {
        totalHoras += listaDisciplinas[j].horasEstudadas;
    }
    document.getElementById('total-horas-globais').textContent = totalHoras;

    // Passa por cada disciplina filtrada e monta o HTML do card
    for (let i = 0; i < listaFiltrada.length; i++) {
        let disciplina = listaFiltrada[i];

        // Regra de três básica pra saber a porcentagem do progresso
        let percentual = 0;
        if (disciplina.cargaTotal > 0) {
            percentual = Math.round((disciplina.horasEstudadas / disciplina.cargaTotal) * 100);
        }

        // Injeta o HTML do card dentro da grade
        gradeDisciplinas.innerHTML += `
            <article class="card">
                <div class="card-indicador" style="width: ${percentual}%"></div>
                <div class="card-cabecalho">
                    <span class="tag-area">${disciplina.area}</span>
                    <div class="acoes-card">
                        <button class="btn-editar" onclick="editarDisciplina(${disciplina.id})" title="Editar">&#9998;</button>
                        <button class="btn-excluir" onclick="deletarDisciplina(${disciplina.id})" title="Excluir">&times;</button>
                    </div>
                </div>
                <div class="card-info">
                    <h3>${disciplina.nome}</h3>
                    <p>Prof. ${disciplina.professor}</p>
                </div>
                <div class="progresso-texto">
                    <span>Estudado: ${disciplina.horasEstudadas}hrs / ${disciplina.cargaTotal}hrs</span>
                    <span>${percentual}%</span>
                </div>
                <button class="btn btn-outline w-100" onclick="registrarHora(${disciplina.id})">Registrar +1 Hora</button>
            </article>
        `;
    }
}


/* ==========================================================================
   CONTROLE DO MODAL E INTERFACE
   ========================================================================== */

// Botão que abre o formulário de cadastro limpo
if (btnNovo) {
    btnNovo.addEventListener('click', function() {
        formCadastro.reset(); // Limpa os campos
        inputIdEdicao.value = ''; // Garante que não há ID de edição
        document.getElementById('titulo-modal').textContent = 'Cadastrar Disciplina';
        
        // O método .showModal() é nativo da tag <dialog>
        if (modal) {
            modal.showModal();
        } else {
            console.error("Erro: O elemento modal-cadastro não foi encontrado no HTML.");
        }
    });
}

// Botão de fechar (o X do modal)
const btnFechar = document.getElementById('btn-fechar-modal');
if (btnFechar) {
    btnFechar.addEventListener('click', () => modal.close());
}

/* ==========================================================================
   MODO ESCURO (DARK MODE)
   ========================================================================== */

// Verifica se o usuário já curte o modo escuro (checa o que ficou salvo)
if (localStorage.getItem('tema_escolhido') == 'escuro') {
    document.body.classList.add('modo-escuro');
    if (checkboxTema) checkboxTema.checked = true;
}

// Troca o tema e salva a preferência pra não esquecer no próximo acesso
if (checkboxTema) {
    checkboxTema.addEventListener('change', function() {
        document.body.classList.toggle('modo-escuro');
        
        const tema = document.body.classList.contains('modo-escuro') ? 'escuro' : 'claro';
        localStorage.setItem('tema_escolhido', tema);
    });
}

/* Inicia a tela desenhando o que tiver no banco de dados assim que o arquivo carrega */
mostrarNaTela();