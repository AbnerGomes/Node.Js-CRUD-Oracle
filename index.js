const oracledb = require('oracledb');

//workaround para erro DPI-1047 com Node.js node-oracledb 5 no Windows
console.log(process.platform)


if (process.platform === 'win32') {
  try {
    oracledb.initOracleClient({libDir: 'C:\\DIRETORIO\\_DO_INSTANT_CLIENT'});   // 64 bit oracle client diretorio (com escape)
    
  } catch (err) {
    console.error('Whoops!');
    console.error(err);
    process.exit(1);
  }
}


async function run() {

  let connection;

  try {

    connection = await oracledb.getConnection({ user: "abwgomes", password: "dsr640", connectionString: "localhost\\xe" }); //exemplo banco local

    console.log("Successfully connected to Oracle Database");

    // Criando uma tabela
    await connection.execute(`create table Familia (
                                nome varchar2(4000),
                                parentesco varchar2(4000))`);

    // Inserindo dados
    const sql = `insert into Familia (nome, idade) values(:1, :2)`;

    const rows =
          [ ["Abner", "Pai" ],
            ["Ana", "Mae" ],
            ["Ásafe", "Filho" ],
            ["Emanuele", "Filha" ],
            ["Rebeca", "Filha" ],
            ["Benjamin", "Caçula" ] ];

    let result = await connection.executeMany(sql, rows);

    console.log(result.rowsAffected, "Rows Inseridas");

    connection.commit();

    // Selecionar os dados cadastrados

    result = await connection.execute(
      `select nome, idade from Familia`,
      [],
      { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT });

    const rs = result.resultSet;
    let row;

    while ((row = await rs.getRow())) {
              console.log(row.NOME, "Cadastrado(a) com sucesso!");
    }

    await rs.close();

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

run();