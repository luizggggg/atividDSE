document.addEventListener('DOMContentLoaded', function () {
    // Utilitário para formatar moeda (R$)
    function moedaBR(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    // Normaliza a entrada (troca vírgula por ponto e converte para número)
    function toNumber(val) {
        if (typeof val === 'number') return val;
        if (!val && val !== 0) return NaN;
        return parseFloat(String(val).trim().replace(',', '.'));
    }

    // Seleciona os elementos do DOM
    const form = document.getElementById('form');
    const erro = document.getElementById('erro');
    const resultados = document.getElementById('resultados');
    const tabelaSecao = document.getElementById('tabelaSecao');
    const outPrecoComDesconto = document.getElementById('precoComDesconto');
    const outValorParcela = document.getElementById('valorParcela');
    const outTotalPagar = document.getElementById('totalPagar');
    const outEconomia = document.getElementById('economia');
    const corpoTabela = document.querySelector('#tabela tbody');

    // Se o formulário não existir, exibe um erro no console e para a execução.
    if (!form) {
        console.error('Formulário não encontrado (id="form"). Verifique o HTML.');
        return;
    }

    // Adiciona um "ouvinte de evento" para o envio do formulário
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Impede o envio padrão do formulário e o recarregamento da página
        erro.textContent = ''; // Limpa a mensagem de erro anterior

        try {
            // Lê e converte os valores dos campos de entrada
            const preco = toNumber(document.getElementById('preco').value);
            const desconto = toNumber(document.getElementById('desconto').value);
            const taxa = toNumber(document.getElementById('taxa').value);
            const parcelas = parseInt(document.getElementById('parcelas').value, 10);

            // Valida as entradas
            if (isNaN(preco) || preco <= 0) {
                throw new Error('Informe um preço válido (> 0).');
            }
            if (isNaN(desconto) || desconto < 0) {
                throw new Error('Desconto deve ser ≥ 0.');
            }
            if (isNaN(taxa) || taxa < 0) {
                throw new Error('Taxa deve ser ≥ 0.');
            }
            if (isNaN(parcelas) || parcelas < 1) {
                throw new Error('Número de parcelas deve ser ≥ 1.');
            }

            // Realiza os cálculos
            const precoComDesconto = preco * (1 - desconto / 100);
            const i = taxa / 100; // Taxa decimal ao mês
            const J_total = precoComDesconto * i * parcelas; // Juros simples total
            const totalPagar = precoComDesconto + J_total;
            const valorParcela = totalPagar / parcelas;
            const economia = preco - precoComDesconto;

            // Exibe os resultados principais na tela
            outPrecoComDesconto.textContent = moedaBR(precoComDesconto);
            outValorParcela.textContent = moedaBR(valorParcela);
            outTotalPagar.textContent = moedaBR(totalPagar);
            outEconomia.textContent = moedaBR(economia);
            resultados.hidden = false;

            // Limpa o corpo da tabela para recriá-la
            corpoTabela.innerHTML = '';

            const jurosMesConstante = precoComDesconto * i; // Juros do mês (constante)
            const amortizacaoConstante = precoComDesconto / parcelas; // Amortização (constante)

            // Loop para criar as linhas da tabela de parcelas
            for (let mes = 1; mes <= parcelas; mes++) {
                const principalRestante = Math.max(0, precoComDesconto - amortizacaoConstante * mes);

                const tr = document.createElement('tr');
                const tdMes = document.createElement('td');
                tdMes.textContent = mes;

                const tdParcela = document.createElement('td');
                tdParcela.textContent = moedaBR(valorParcela);

                const tdJurosMes = document.createElement('td');
                tdJurosMes.textContent = moedaBR(jurosMesConstante);

                const tdAmortizacao = document.createElement('td');
                tdAmortizacao.textContent = moedaBR(amortizacaoConstante);

                const tdRestante = document.createElement('td');
                tdRestante.textContent = moedaBR(principalRestante);

                // Adiciona as células na linha da tabela
                tr.appendChild(tdMes);
                tr.appendChild(tdParcela);
                tr.appendChild(tdJurosMes);
                tr.appendChild(tdAmortizacao);
                tr.appendChild(tdRestante);

                // Adiciona a linha ao corpo da tabela
                corpoTabela.appendChild(tr);
            }
            tabelaSecao.hidden = false;

        } catch (err) {
            // Em caso de erro, exibe a mensagem de erro
            console.error(err);
            erro.textContent = err.message || 'Ocorreu um erro — abra o Console (F12) para ver detalhes.';
            resultados.hidden = true;
            tabelaSecao.hidden = true;
        }
    });
});