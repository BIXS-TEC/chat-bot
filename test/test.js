
function printObj(obj) {
    console.log(JSON.stringify(obj));
}

const client = {
    name: 'John',
    age: 22
}

printObj({client: client})