const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table')
const colors = require('colors');
const connection = require('./connection');
const { connect } = require('./connection');

// Arrays
const employeesArray = () => {
  const employees = [];
  connection.query('SELECT CONCAT_WS(" ", employees.first_name, employees.last_name) AS Employees FROM employee ORDER BY Employees ASC', function(err, res) {
    if (err) throw err;
    res.forEach(({ Employees }) => employees.push(Employees));
  })
  return employees;
};

const rolesArray = () => {
  const roles = [];
  connection.query('SELECT * FROM roles', function(err, res) {
    if (err) throw err;
    res.forEach(({ titles }) => roles.push(titles));
  })
  return roles;
};

const departmentsArray = () => {
  const departments = [];
  connection.query('SELECT * FROM departments', function(err, res) {
    if (err) throw err;
    res.forEach(({ department_name }) => departments.push(department_name));
  })
  return departments;
};

// Colorized Fonts and Other Default Language
const welcomingMsg = `* * * * WELCOME TO EMPLOYEE TRACKER AND DATABASE. * * * *\n`.underline.blue;
const error = `\r\n>> ERR: `.red.bold;
const noInfoEntered = `No data was entered.`;

// Welcome and Instructions
const welcome = () => {
  return inquirer
  .prompt([
    {
      type: 'input',
      name: 'welcome',
      message: welcomingMsg + '\nYou have access to edit information about employees, roles and departments. \nLet\'s start. Hit ENTER to continue.\n',
    },
  ])
  .then(startingPrompts)
};

const startingPrompts = async () => {
  return await inquirer
    .prompt([
      {
        name: 'action',
        type: 'rawlist',
        message: 'What do you want to do?',
        choices: [
          'View all EMPLOYEES',
          'Add EMPLOYEE',
          'Update EMPLOYEE role',

          'View all ROLES',
          'Add ROLES',

          'View all DEPARTMENTS',
          'Add DEPARTMENTS',
        ],
      },
    ])
    .then((answer) => {
      switch (answer.action) {
        case 'View all EMPLOYEES':
          viewAllEmployees();
          break;

        case 'Add EMPLOYEE':
          addAnEmployee();
          break;

        case 'Update EMPLOYEE role':
          updateAnEmployeeRole();
          break;

        case 'View all ROLES':
          viewAllRoles();
          break;

        case 'Add ROLES':
          addARole();
          break;

        case 'View all DEPARTMENTS':
          viewAllDepartments();
          break;

        case 'Add DEPARTMENTS':
          addADepartment();
          break;

        default:
          console.log(`Invalid action: ${answer.action}`);
          break;
      }
    });
};

// CRUD Functions

// CREATE (Add)
const addAnEmployee = async() => {
  const employee = await inquirer
  .prompt([
    {
      name: 'first_name',  
      type: 'input',
      message: 'What is the Employee\'s FIRST NAME.',
      validate: first_name => {
        if (first_name) {
          return true;
          } else {
            console.log (error + noInfoEntered + `Please enter the Employee\'s FIRST NAME.`);
            return false; 
          }
      },
    },
    {
      name: 'last_name',  
      type: 'input',
      message: ({ first_name }) => `What is ${first_name}\'s LAST NAME.`,
      validate: last_name => {
        if (last_name) {
          return true;
        } else {
          ({ first_name }) => console.log (error + noInfoEntered + `Please enter ${first_name}\'s LAST NAME.`);
          return false; 
        }
      },
    },
    {
      name: 'role',  
      type: 'list',
      message: ({ first_name, last_name }) => `Input the role of ${first_name + ' ' + last_name}\'s by scrolling through the below menu.`,
      choices: rolesArray()
    },
    {
      name: 'manager',  
      type: 'list',
      message: ({ first_name, last_name }) => `Input the Manager of ${first_name + ' ' + last_name}\'s by scrolling through the below menu.`,
      choices: employeesArray()
    },
  ])
  .then((answers) => {
    let roleTitle = answers.role;
    let roleID;
    const findEmployeeRoleID = () => {
      connection.query('SELECT * FROM roles WHERE title=?',
        [`${roleTitle}`],
        (err, res) => {
          if (err) throw err;
          roleID = res[0].id;
          console.log("roleID", roleID);
        }
      );
    };
    findEmployeeRoleID();

    let managerName = answers.manager;
    let managerID;
    const findManagersID = () => {
      connection.query('SELECT employee.id, CONCAT_WS(" ", employee.first_name, employee.last_name) AS Employee FROM employee HAVING Employee=?',
        [`${managerName}`],
        (err, res) => {
          if (err) throw err;
          managerID = res[0].id;
          console.log("managerID", managerID);
        }
      );
    };
    findManagersID();

    console.log("Added ROLE-ID before insert query", roleID);
    console.log("Added MANAGER-ID before insert query", managerID);

    const insertTheNewEmployee = async () => { 
      const mySQLConnection = await connection.query('INSERT INTO employee SET ?',
        {
          first_name: answers.first_name,
          last_name: answers.last_name,
          role_id: roleID,
          manager_id: managerID
        },
        (err, res) => {
          if (err) throw err;
          console.log("INSERT RES", res);
          console.log(`${answers.first_name} ${answers.last_name} was successfully added. \n`);
          startingPrompts();
        }
      );
      // connection.end;
    }
    insertTheNewEmployee();
  });
};

const addARole = () => {
  return inquirer
  .prompt([
    {
      name: 'title',  
      type: 'input',
      message: 'Input new ROLE (title).',
      validate: title => {
        if (title) {
          return true;
          } else {
            console.log (error + noInfoEntered + `Please enter a new ROLE (title).`);
            return false; 
          }
      },
    },
    {
      name: 'salary',  
      type: 'input',
      message: ({ title }) => `What is the ${title}\'s SALARY.`,
      validate: salary => {
        if (salary) {
          return true;
        } else {
          ({ title }) => console.log (error + noInfoEntered + `Please enter the ${title}\'s SALARY.`);
          return false; 
        }
      },
    },
    {
      name: 'department',  
      type: 'input',
      message: ({ title }) => `What is ${title}\'s DEPARTMENT: scroll through the menu below.`,
      choices: departmentsArray()
    },
  ])
  .then((answers) => {
    let departmentID = departmentsArray().indexOf(val.department) +1
    connection.query('INSERT INTO roles SET ?',
      {
        title: answers.title,
        salary: answers.salary,
        department_id: departmentID
      },
      (err, res) => {
        if (err) throw err;
        console.log(`${res.affectedRows} The Role has been added.\n`);
        startingPrompts();
      }
    );
    connection.end;
  })
};

const addADepartment = () => {
  return inquirer
    .prompt([
    {
      name: 'departmentName',  
      type: 'input',
      message: 'Input new DEPARTMENT NAME.',
      validate: departmentName => {
        if (departmentName) {
          return true;
          } else {
            console.log (error + noInfoEntered + `Please enter a new DEPARTMENT NAME.`);
            return false; 
          }
      },
    },
  ])
  .then((answers) => {
    const query = 'INSERT INTO departments SET ?';
    connection.query(query, [
      {
        department_name: answers.departmentName,
      },
    ],
    (err, res) => {
      if (err) throw err;
    },
    console.log(`${res.affectedRows} The Department has been added.\n`)
    );
    connection.end;
  })
};

// READ (View)
function viewAllEmployees() {
  let query = `SELECT employees.first_name, employees.last_name, roles.title, roles.salary, departments.department_name `;
  query += `CONCAT (e.first_name, ' ', e.last_name) AS Manager `;
  query += `FROM employees `;
  query += `INNER JOIN role ON roles.id = employees.role_id INNER JOIN departments ON department.id = role.department_id `;
  query += `LEFT JOIN employee e ON employees.manager_id = e.id `;
  query += `ORDER BY last_name ASC`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    connection.end;
  })
  startingPrompts()
}

const viewAllRoles = () => {
  let query = `SELECT * FROM roles`;
  query += `INNER JOIN departments ON roles.department_id = departments.id`;
  query += `ORDER BY title`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    connection.end;
  })
  startingPrompts()
}

const viewAllDepartments = () => {
  let query = `SELECT * FROM departments `;
  query += `ORDER BY department_name`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    connection.end;
  })
  startingPrompts()
}

// UPDATE 
const updateAnEmployeeRole = () => {
  return inquirer
    .prompt([
      {
        name: 'employee',  
        type: 'input',
        message: `Select the employee whose ROLE you would like to UPDATE by scrolling through the menu below.`,
        choices: employeesArray()
      },
    {
      name: 'role',  
      type: 'input',
      message: ({ employee }) => `Input ${employee}\'s ROLE: Scroll the menu below.`,
      choices: rolesArray()
    },
  ])
  .then(answers => {
    const roleID = rolesArray().indexOf(val.role) +1
    const managerID = employeesArray().indexOf(val.employee) + 1
    connection.query(
      'INSERT INTO employees SET ?',
      {
        first_name: answers.first_name,
        last_name: answers.last_name,
        manager_id: managerID,
        role_id: roleID
      },
      (err, res) => {
        if (err) throw err;
        console.log(`${res.affectedRows} The Employee has been added.\n`);
      }
    );
    connection.end;
  }),
  startingPrompts()
};

// DELETE (currently empty)

// Function to Initialize App
const init = () => welcome()

// Initialize App
init();