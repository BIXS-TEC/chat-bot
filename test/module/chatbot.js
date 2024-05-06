const name = 'Bix';
const phone = '47991025923'
const productList = {
    Lanches: {
        '0': {
            id: '0',
            name: 'X-Bacon',
            price: 25.50
        },
        '1': {
            id: '1',
            name: 'X-Tudo',
            price: 28.50
        },
    }
}

function addProduct(product){
    const len = Object.keys(productList['Lanches']).length;
    productList['Lanches'][`${len}`] = product;
    console.log('Product adicionado!');
    console.log('new productList: \n', productList);
}

