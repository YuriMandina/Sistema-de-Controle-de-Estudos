// Pegando os elementos do HTML que vou precisar
const formCadastro = document.getElementById('form-disciplina');
const gradeDisciplinas = document.getElementById('grade-disciplinas');
const modal = document.getElementById('modal-cadastro');
const inputIdEdicao = document.getElementById('id-disciplina');

// Tenta carregar os dados salvos, se não tiver nada cria um array vazio
let listaDisciplinas = JSON.parse(localStorage.getItem('banco_estudos')) || [];

formCadastro.addEventListener('submit', function(evento) {
    evento.preventDefault(); // Pra página não recarregar do nada

    const nome = document.getElementById('nome').value;
    const professor = document.getElementById('professor').value;
    const cargaTotal = Number(document.getElementById('carga').value);
    const area = document.getElementById('area').value;
    const idEdicao = inputIdEdicao.value;

    if (idEdicao != '') {
        // Editando uma disciplina que já existe
        for (let i = 0; i < listaDisciplinas.length; i++) {
            if (listaDisciplinas[i].id == idEdicao) {
                listaDisciplinas[i].nome = nome;
                listaDisciplinas[i].professor = professor;
                listaDisciplinas[i].cargaTotal = cargaTotal;
                listaDisciplinas[i].area = area;
            }
        }
    } else {
        // Criando uma disciplina nova
        const novaDisciplina = {
            id: Date.now(), // uso o tempo atual como ID pra não repetir
            nome: nome,
            professor: professor,
            cargaTotal: cargaTotal,
            area: area,
            horasEstudadas: 0 
        };
        listaDisciplinas.push(novaDisciplina);
    }

    salvarNoBanco();
    modal.close();
    formCadastro.reset();
    inputIdEdicao.value = ''; 
    mostrarNaTela(); // atualiza a tela
});

function salvarNoBanco() {
    localStorage.setItem('banco_estudos', JSON.stringify(listaDisciplinas));
}

// Função pra apagar a matéria
function deletarDisciplina(id) {
    if (confirm('Tem certeza que quer apagar?')) {
        // Filtra o array tirando o id que eu passei
        listaDisciplinas = listaDisciplinas.filter(d => d.id != id);
        salvarNoBanco();
        mostrarNaTela();
    }
}

// Função pra preencher o formulário com os dados da matéria pra editar
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

// Aumenta a hora estudada
function registrarHora(id) {
    const d = listaDisciplinas.find(d => d.id == id);
    if (d.horasEstudadas < d.cargaTotal) {
        d.horasEstudadas++;
        salvarNoBanco();
        mostrarNaTela();
    } else {
        alert('Você já completou a carga horária dessa matéria!');
    }
}

// Função principal que desenha os cards no HTML
function mostrarNaTela() {
    gradeDisciplinas.innerHTML = ''; // Limpa a tela antes de desenhar
    let totalHoras = 0;

    // Mostra ou esconde a mensagem de lista vazia
    if (listaDisciplinas.length == 0) {
        document.getElementById('lista-vazia').style.display = 'block';
    } else {
        document.getElementById('lista-vazia').style.display = 'none';
    }

    // Passa por cada disciplina e cria o HTML do card
    for (let i = 0; i < listaDisciplinas.length; i++) {
        let disciplina = listaDisciplinas[i];
        totalHoras = totalHoras + disciplina.horasEstudadas;

        // Calcula a porcentagem pra barra de progresso
        let percentual = 0;
        if (disciplina.cargaTotal > 0) {
            percentual = Math.round((disciplina.horasEstudadas / disciplina.cargaTotal) * 100);
        }

        // Uso innerHTML direto, é mais fácil que criar os elementos um por um
        gradeDisciplinas.innerHTML += `
            <article class="card">
                <div class="card-indicador" style="width: ${percentual}%"></div>
                <div class="card-cabecalho">
                    <span class="tag-area">${disciplina.area}</span>
                    <div class="acoes-card">
                        <button class="btn-editar" onclick="editarDisciplina(${disciplina.id})">&#9998;</button>
                        <button class="btn-excluir" onclick="deletarDisciplina(${disciplina.id})">&times;</button>
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

    document.getElementById('total-horas-globais').textContent = totalHoras;
}

// Configurando os botões de abrir e fechar o modal
document.getElementById('btn-novo').addEventListener('click', function() {
    formCadastro.reset();
    inputIdEdicao.value = '';
    document.getElementById('titulo-modal').textContent = 'Cadastrar Disciplina';
    modal.showModal();
});

document.getElementById('btn-fechar-modal').addEventListener('click', function() {
    modal.close();
});

// Chama a função logo que abre a página pra mostrar os dados salvos
mostrarNaTela();


// --------- Configuração do Modo Escuro --------- //

const checkboxTema = document.getElementById('checkbox-tema');

// Verifica se o usuário já tinha deixado no modo escuro antes
if (localStorage.getItem('tema_escolhido') == 'escuro') {
    document.body.classList.add('modo-escuro');
    if (checkboxTema) checkboxTema.checked = true; // Deixa o switch ativado
}

if (checkboxTema) {
    // Quando marca ou desmarca o checkbox, liga ou desliga a classe
    checkboxTema.addEventListener('change', function() {
        document.body.classList.toggle('modo-escuro');
        
        // Salva a preferência pra não perder quando atualizar a página
        if (document.body.classList.contains('modo-escuro')) {
            localStorage.setItem('tema_escolhido', 'escuro');
        } else {
            localStorage.setItem('tema_escolhido', 'claro');
        }
    });
}