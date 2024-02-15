//Mascara para o CNPJ
var cnpjInput = document.getElementById('cnpj');

var cnpjMask = IMask(cnpjInput, {
    mask: '00.000.000/0000-00'
});

//Mascara para a Inscrição Estadual
var inscricaoEstadualInput = document.getElementById('inscricaoEstadual');

var inscricaoEstadualMask = IMask(inscricaoEstadualInput, {
    mask: '00.000.000-0'
});

//Mascara para a Inscrição Municipal
var inscricaoMunicipalInput = document.getElementById('inscricaoMunicipal');

var inscricaoMunicipalMask = IMask(inscricaoMunicipalInput, {
    mask: '000000-0'
});

//Mascara para o CEP
var cepInput = document.getElementById('cep');

cepInput.addEventListener('input', function(event) {
    var cep = cepInput.value;

    cep = cep.replace(/\D/g, '');

    //Verifica se o CEP tem o comprimento adequado para enviar a solicitação à API
    if (cep.length === 8) {
        cep = cep.substring(0, 5) + '-' + cep.substring(5);
        cepInput.value = cep;

        //Monta a URL de consulta de CEP
        var url = 'https://viacep.com.br/ws/' + cep + '/json';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                //Preenche os campos de endereço automaticamente com os dados obtidos pela API
                document.getElementById('endereco').value = data.logradouro;
                document.getElementById('bairro').value = data.bairro;
                document.getElementById('municipio').value = data.localidade;
                document.getElementById('estado').value = data.uf;
            })
            .catch(error => {
                console.error('Erro ao consultar o CEP:', error);
            });
    }
});

//Seleciona os campos de entrada de quantidade em estoque, valor unitário e valor total
var quantidadeEstoqueInput = document.getElementById('quantidadeEstoque');
var valorUnitarioInput = document.getElementById('valorUnitario');
var valorTotalSpan = document.getElementById('valorTotal');

quantidadeEstoqueInput.addEventListener('input', atualizarValorTotal);
valorUnitarioInput.addEventListener('input', atualizarValorTotal);

//Função para atualizar o valor total
function atualizarValorTotal() {
    var quantidade = parseFloat(quantidadeEstoqueInput.value);
    var valorUnitario = parseFloat(valorUnitarioInput.value.replace(',', '.'));

    if (!isNaN(quantidade) && !isNaN(valorUnitario)) {
        //Calcula o valor total
        var valorTotal = quantidade * valorUnitario;
        valorTotalSpan.textContent = valorTotal.toLocaleString('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        valorTotalSpan.style.fontFamily = 'Arial';
        valorTotalSpan.style.fontSize = '16px';
        valorTotalSpan.style.color = 'black';   
        valorTotalSpan.style.backgroundColor = 'lightgray';
    } else {
        valorTotalSpan.textContent = '';
    }
}

//Função para adicionar um novo produto
function adicionarOuvintes() {
    var inputs = document.querySelectorAll('#produtosContainer input[type="number"]');
    inputs.forEach(function(input) {
        input.addEventListener('input', atualizarValorTotal);
    });
}

adicionarOuvintes();

var addButton = document.getElementById('addButton');
var produtosContainer = document.getElementById('produtosContainer');

addButton.addEventListener('click', function() {
    var produtoExistente = document.querySelector('.fieldset-border:last-of-type');
    var novoProduto = produtoExistente.cloneNode(true);

    var numeroProduto = document.querySelectorAll('.fieldset-border').length; // Incrementar o número do produto
    novoProduto.querySelector('.legend-border').textContent = 'Produto - ' + numeroProduto;

    novoProduto.querySelectorAll('[id]').forEach(function(elemento) {
        var idAntigo = elemento.id;
        var idNovo = idAntigo.replace(/\d+$/, numeroProduto);
        elemento.id = idNovo;
        elemento.value = '';

        //Limpa o campo do valor total
        if (idNovo === 'valorTotal') {
            elemento.textContent = '';
        }
    });

    produtosContainer.appendChild(novoProduto);

    adicionarOuvintes();
});

function handleExcluir() {
    var produtos = document.querySelectorAll('.fieldset-border');
    if (produtos.length > 1) {
        produtos[produtos.length - 1].remove();
    } else {
        alert("É obrigatório ter pelo menos um produto cadastrado.");
    }
}

//Função para incluir anexo
function handleAttach() {
    document.getElementById('fileInput').click();
}

function handleFileChange(input) {
    if (input.files && input.files[0]) {
        var file = input.files[0];
        var reader = new FileReader();

        reader.onload = function(e) {
            var nomeArquivo = file.name;

            var index = document.querySelectorAll('.anexo').length + 1;
            var container = document.createElement('section');
            container.className = 'container grid grid-template-columns-3b anexo';
            container.id = 'anexo' + index;
            
            var deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'icon-button-trash';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.onclick = function() {
                handleDelete(index);
            };

            var viewButton = document.createElement('button');
            viewButton.type = 'button';
            viewButton.className = 'icon-button-eye';
            viewButton.innerHTML = '<i class="fas fa-eye"></i>';
            viewButton.onclick = function() {
                handleView(index);
            };

            var nomeArquivoElement = document.createElement('p');
            nomeArquivoElement.textContent = nomeArquivo;

            container.appendChild(deleteButton);
            container.appendChild(viewButton);
            container.appendChild(nomeArquivoElement);

            document.getElementById('anexosContainer').appendChild(container);
        };

        reader.readAsText(file);
    }
}

//Função para excluir anexo
function handleDelete(index) {
    sessionStorage.removeItem('anexo' + index);

    var anexoElement = document.getElementById('anexo' + index);
    if (anexoElement) {
        anexoElement.parentNode.removeChild(anexoElement);
    }
}

//Função para visualizar o anexo
function handleView(index) {
    var anexo = sessionStorage.getItem('anexo' + index);
    console.log('Conteúdo do anexo:', anexo);

    if (anexo) {
        var blob = new Blob([anexo], { type: 'application/octet-stream' });

        var url = URL.createObjectURL(blob);

        var link = document.createElement('a');
        link.href = url;
        link.download = 'anexo' + index; 
        link.style.display = 'none';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    } else {
        alert('O anexo não está disponível para visualização.');
    }
}

document.getElementById("btnSalvarFornecedor").addEventListener("click", function() {
    var razaoSocial = document.getElementById("razaoSocial").value;
    var nomeFantasia = document.getElementById("nomeFantasia").value;
    var cnpj = document.getElementById("cnpj").value;
    var inscricaoEstadual = document.getElementById("inscricaoEstadual").value;
    var inscricaoMunicipal = document.getElementById("inscricaoMunicipal").value;
    var nomeContato = document.getElementById("nomeContato").value;
    var telefoneContato = document.getElementById("telefoneContato").value;
    var emailContato = document.getElementById("emailContato").value;
    var descricaoProduto = document.getElementById("descricaoProduto").value;
    var unidadeMedida = document.getElementById("unidadeMedida").value;
    var quantidadeEstoque = document.getElementById("quantidadeEstoque").value;
    var valorUnitario = document.getElementById("valorUnitario").value;
    var valorTotal = document.getElementById("valorTotal").value;

    //Cria um objeto com os dados do fornecedor
    var fornecedor = {
        "razaoSocial": razaoSocial,
        "cnpj": cnpj,
        "nomeFantasia": nomeFantasia,
        "inscricaoEstadual": inscricaoEstadual,
        "inscricaoMunicipal": inscricaoMunicipal,
        "nomeContato": nomeContato,
        "telefoneContato": telefoneContato,
        "emailContato": emailContato
    };

    //Cria um objeto com os dados do produto
    var produto = {
        "descricaoProduto": descricaoProduto,
        "unidademedida": unidadeMedida,
        "quantidadeEstoque": quantidadeEstoque,
        "valorUnitario": valorUnitario,
        "valorTotal": valorTotal
    };

    //Converte o objeto em uma string JSON
    var jsonFornecedor = JSON.stringify(fornecedor);

    if (jsonFornecedor) {
        var fornecedor = JSON.parse(jsonFornecedor);
        console.log("Dados do fornecedor:");
        console.log(fornecedor);
    } else {
        console.log("Nenhum fornecedor salvo.");
    }

    //Converte o objeto em uma string JSON
    var jsonProduto = JSON.stringify(produto);
    if (jsonProduto) {
        var produto = JSON.parse(jsonProduto);
        console.log("Dados do produto:");
        console.log(produto);
    } else {
        console.log("Nenhum produto salvo.");
    }

    //Limpa os campos do formulário após salvar
    document.getElementById("razaoSocial").value = "";
    document.getElementById("nomeFantasia").value = "";
    document.getElementById("cnpj").value = "";
    document.getElementById("inscricaoEstadual").value = "";
    document.getElementById("inscricaoMunicipal").value = "";
    document.getElementById("nomeContato").value = "";
    document.getElementById("telefoneContato").value = "";
    document.getElementById("emailContato").value = "";
    document.getElementById("descricaoProduto").value = "";
    document.getElementById("unidadeMedida").value = "";
    document.getElementById("quantidadeEstoque").value = "";
    document.getElementById("valorUnitario").value = "";
    document.getElementById("valorTotal").value = "";
});

