function init_deparment_and_courses(
  department_select_list,
  course_select_list
) {
  fetch("http://127.0.0.1:8000/api/departments")
    .then((response) => response.json())
    .then((data) => {
      departments = data["departments"];
      load_departments(departments, department_select_list, course_select_list);
    });
}

function load_departments(
  departments,
  department_select_list,
  course_select_list
) {
  for (deparment in departments) {
    const newOption = document.createElement("option");
    const optionText = document.createTextNode(departments[deparment]);
    // set option text
    newOption.appendChild(optionText);
    // and option value
    newOption.setAttribute("value", departments[deparment]);
    department_select_list.appendChild(newOption);
  }
  load_courses(course_select_list, departments[0]);
}
function load_courses(select_list, department) {
  select_list.options.length = 0;
  courses = [];
  json = {};
  fetch("http://127.0.0.1:8000/api/" + department)
    .then((response) => response.json())
    .then((data) => {
      courses = data["courses"];
      //console.log(courses);
      setOptions(courses, select_list);
    });
}

function setOptions(course_list, select_list) {
  for (course in courses) {
    const newOption = document.createElement("option");
    const optionText = document.createTextNode(courses[course]);
    // set option text
    newOption.appendChild(optionText);
    // and option value
    newOption.setAttribute("value", courses[course]);
    select_list.appendChild(newOption);
  }
}
async function getSections(department, course_code) {
  let response = await fetch(
    "http://127.0.0.1:8000/api/" + department + "/" + course_code
  );

  if (response.ok) {
    // if HTTP-status is 200-299
    // get the response body (the method explained below)
    let json = await response.json();
    return json;
  } else {
    alert("HTTP-Error: " + response.status);
  }
}

function addCourseToTable(
  tableBody,
  section_datas,
  added_course_list,
  chosen_sections,
  courses_with_sections_and_hours,
  cells_with_number,
  avaliable_plans,
  plan_buttons
) {
  //removeAvaliablePlans(avaliable_plans, plan_buttons);
  // Insert a row in the table at the last row
  var newRow = tableBody.insertRow();
  newRow.setAttribute("class", "class_course_row");
  var cell_remove_button = newRow.insertCell();
  var cell_course_code = newRow.insertCell();
  var cell_sections_tables = newRow.insertCell();

  var button = document.createElement("button");
  cell_remove_button.appendChild(button);
  button.innerHTML = "x";
  button.setAttribute("value", section_datas["course_code"]);
  button.style =
    "width: fit-content;height: fit-content;background-color: bisque;";
  cell_remove_button.style =
    "border-right: 2px solid black; text-align: center;background-color: burlywood;";
  button.onclick = function () {
    row = button.parentElement.parentElement;
    row.remove();
    /*
    if (courses_with_sections_and_hours[section_data["course_code"]]) {
      
    }*/
    if (chosen_sections[section_datas["course_code"]]) {
      delete chosen_sections[section_datas["course_code"]];
      rows_and_columns =
        courses_with_sections_and_hours[section_datas["course_code"]];
      removePaint(
        rows_and_columns,
        cells_with_number,
        section_datas["course_code"]
      );
      delete courses_with_sections_and_hours[section_datas["course_code"]];
    }
    delete added_course_list[section_datas["course_code"]];
    removeAvaliablePlans(avaliable_plans, plan_buttons);
  };

  var cell_code_data = document.createTextNode(section_datas["course_code"]);
  cell_course_code.appendChild(cell_code_data);
  cell_course_code.setAttribute("class", "class_course_code");

  var table = document.createElement("table");
  table.setAttribute("class", "class_default_table");
  cell_sections_tables.appendChild(table);

  var thead = document.createElement("thead");

  var başlık1 = document.createElement("th");
  başlık1.innerHTML = "Section";
  başlık1.style = style = "font-size: large; background-color: #7fffd4;";
  var başlık2 = document.createElement("th");
  başlık2.innerHTML = "Teacher";
  başlık2.style = style = "font-size: large; background-color: #5ddfb3;";
  var başlık4 = document.createElement("th");
  başlık4.innerHTML = "Hours";
  başlık4.style = style = "font-size: large; background-color: #31d19b;";
  var başlık5 = document.createElement("th");
  başlık5.innerHTML = "Chosen";
  başlık5.style = " font-size: large; background-color: #63e4b9;";

  thead.appendChild(başlık1);
  thead.appendChild(başlık2);
  thead.appendChild(başlık4);
  thead.appendChild(başlık5);
  table.appendChild(thead);

  var tbody = document.createElement("tbody");
  var sections = section_datas["sections"];
  for (i = 0; i < sections.length; i++) {
    section_data = sections[i];
    var section_row = tbody.insertRow();
    color = i % 2 == 0 ? "#f96e6e" : "#ec8e8e";
    section_row.setAttribute("class", "class_section_rows");
    section_row.style = "background-color: " + color + ";";
    var section = section_row.insertCell();
    section.style = "text-align: center;";
    var teacher = section_row.insertCell();
    var hours = section_row.insertCell();
    checkbox = section_row.insertCell();

    var checkbox_element = document.createElement("input");
    checkbox_element.setAttribute("type", "checkbox");
    checkbox_element.setAttribute("value", i);
    checkbox.appendChild(checkbox_element);
    checkbox.style = "text-align: center;";
    (function (_checkbox_element) {
      checkbox_element.addEventListener("click", function () {
        section_data = section_datas["sections"][this.value];
        //console.log(section_data);
        rows_and_columns = getRowsAndColumns(section_data);
        if (this.checked) {
          if (chosen_sections[section_datas["course_code"]]) {
            removePaint(
              courses_with_sections_and_hours[section_datas["course_code"]],
              cells_with_number,
              section_datas["course_code"]
            );
            previous_section = chosen_sections[section_datas["course_code"]];
            tbody = this.parentElement.parentElement.parentElement;
            tbody.children[
              previous_section
            ].children[3].children[0].checked = false;
          } else {
            courses_with_sections_and_hours[section_datas["course_code"]] = [];
          }
          chosen_sections[section_datas["course_code"]] = this.value;
          courses_with_sections_and_hours[
            section_datas["course_code"]
          ] = rows_and_columns;
          paintRowsAndColumns(
            rows_and_columns,
            cells_with_number,
            section_datas["course_code"] + "-" + section_data["session_number"]
          );
        } else {
          removePaint(
            courses_with_sections_and_hours[section_datas["course_code"]],
            cells_with_number,
            section_datas["course_code"]
          );
          delete courses_with_sections_and_hours[section_datas["course_code"]];
          delete chosen_sections[section_datas["course_code"]];
        }
      });
    })(
      checkbox_element
    ); /*
    checkbox_element.onclick = function () {
      console.log(checkbox_element.value);
      
      
    };*/

    section.innerHTML = section_data["session_number"];
    teacher.innerHTML = section_data["teacher"];

    var hours_table = document.createElement("table");
    var hours_table_tbody = document.createElement("tbody");

    hours_list = section_data["hours"];

    for (j = 0; j < hours_list.length; j++) {
      var hour_data = hours_list[j];
      hour_data_concatted =
        hour_data["day"] +
        " " +
        hour_data["start"] +
        "-" +
        hour_data["end"] +
        " " +
        hour_data["place"] +
        " " +
        hour_data["type"];
      var hour_row = hours_table_tbody.insertRow();
      var cell_hour_data = hour_row.insertCell();
      cell_hour_data.innerHTML = hour_data_concatted;
    }
    hours_table.appendChild(hours_table_tbody);
    hours.appendChild(hours_table);
    tbody.appendChild(section_row);
  }

  table.append(tbody);
}

function removeAvaliablePlans(avaliable_plans, plan_buttons) {
  // remove buttons
  len = plan_buttons.children.length;
  for (i = 0; i < len; i++) {
    plan_buttons.children[0].remove();
  }
  avaliable_plans = {};
  //console.log("removal of plans");
  //console.log(avaliable_plans);
}
function getRowsAndColumns(section_data) {
  hours_list = section_data["hours"];
  rows_and_columns = [];
  for (j = 0; j < hours_list.length; j++) {
    var hour_data = hours_list[j];
    row_and_column = getRowAndColumn(hour_data);
    rows_and_columns.push(row_and_column);
  }
  return rows_and_columns;
}

function removePaint(rows_and_columns, cells_with_number, course_name) {
  course_name = course_name;
  for (i = 0; i < rows_and_columns.length; i++) {
    hour = rows_and_columns[i];
    start_row = hour[0];
    lecture_count = hour[1];
    day_number = hour[2];
    for (j = 0; j < lecture_count; j++) {
      //path = "/html/body/div[2]/table/tbody/tr["+ (start_row + j) +"]/td["+ day_number +"]";
      row = start_row + j;
      id = row + "" + day_number;
      cell = document.getElementById(id);
      oldContent = cell.innerHTML;

      //console.log("old content: " + oldContent);
      index = oldContent.indexOf(course_name);
      len = course_name.length + 4;
      //console.log(course_name);
      //console.log("index: " + index + ", length: " + len);
      //console.log("total len: " + oldContent.length);
      totalLen = cell.innerHTML.length;
      // "ab" len = 2, total = 7
      cell.innerHTML =
        oldContent.substring(0, index) +
        oldContent.substring(index + len, totalLen);
      cells_with_number[id] = cells_with_number[id] - 1;
      paint = "#ffe500";
      if (cells_with_number[id] == 1) {
        paint = "#5ade5a";
      } else if (cells_with_number[id] > 1) {
        paint = "#dc7171";
      }
      cell.style = "background-color:" + paint + ";";
    }
  }
}
function paintRowsAndColumns(rows_and_columns, cells_with_number, course_name) {
  course_name = course_name + "  ";
  for (i = 0; i < rows_and_columns.length; i++) {
    hour = rows_and_columns[i];
    start_row = hour[0];
    lecture_count = hour[1];
    day_number = hour[2];
    for (j = 0; j < lecture_count; j++) {
      //path = "/html/body/div[2]/table/tbody/tr["+ (start_row + j) +"]/td["+ day_number +"]";
      row = start_row + j;
      id = row + "" + day_number;
      if (cells_with_number[id]) {
        cells_with_number[id] = cells_with_number[id] + 1;
      } else {
        cells_with_number[id] = 1;
      }
      cell = document.getElementById(id);
      cell.innerHTML = cell.innerHTML + course_name;
      paint = "#5ade5a";
      if (cells_with_number[id] > 1) {
        paint = "#dc7171";
      }
      cell.style = "background-color:" + paint + " ;";
    }
  }
}
function getRowAndColumn(hour_data) {
  day = hour_data["day"];
  start = hour_data["start"];
  end = hour_data["end"];
  index = start.indexOf(":");
  start_hour = parseInt(start.substring(0, index), 10);
  index = end.indexOf(":");
  end_hour = parseInt(end.substring(0, index), 10);
  tuple = [];
  lecture_count = end_hour - start_hour;
  tuple.push(start_hour - 7);
  tuple.push(lecture_count);
  day_number = 0;
  if (day == "Mon") {
    day_number = 1;
  }
  if (day == "Tue") {
    day_number = 2;
  }
  if (day == "Wed") {
    day_number = 3;
  }
  if (day == "Thu") {
    day_number = 4;
  }
  if (day == "Fri") {
    day_number = 5;
  }
  day_number = day_number + 1;
  tuple.push(day_number);
  return tuple;
}

async function sendCoursesToGetPlan(
  courses_dic,
  chosen_sections,
  avaliable_plans,
  plan_buttons
) {
  removeAvaliablePlans(avaliable_plans, plan_buttons);
  courses_with_sections = {};
  Object.keys(courses_dic).forEach(function (key) {
    var course_json = {};
    course_json["course_code"] = key;
    all_sections = courses_dic[key]["sections"];
    if (chosen_sections[key]) {
      course_json["sections"] = [];
      course_json["sections"].push(all_sections[chosen_sections[key]]);
    } else {
      course_json["sections"] = all_sections;
    }
    courses_with_sections[key] = course_json;
  });
  //console.log(courses_with_sections);
  jsonString = JSON.stringify(courses_with_sections);

  json = fetchAvaliablePlans(jsonString);
  json.then(function (data) {
    //console.log(data);
    plans = data["plans"];
    for (i = 0; i < plans.length; i++) {
      var button = document.createElement("button");
      button.setAttribute("class", "plan_button");
      button.setAttribute("value", i);
      button.innerHTML = i + 1;
      button.onclick = function () {
        applySection(avaliable_plans[this.value]);
      };
      plan_buttons.appendChild(button);
      avaliable_plans[i] = plans[i];
    }
  });
}
async function fetchAvaliablePlans(jsonString) {
  const response = await fetch("http://127.0.0.1:8000/api/getPlan", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: jsonString, // body data type must match "Content-Type" header
  });

  if (response.ok) {
    // if HTTP-status is 200-299
    // get the response body (the method explained below)
    let json = await response.json();
    return json;
  } else {
    alert("HTTP-Error: " + response.status);
  }
}

function activate_plan(sections) {
  index = 0;
  Object.keys(courses_dic).forEach(function (key) {
    section_number = sections[index];
    checkSection(index, section_number);
    index = index + 1;
  });
}
function applySection(sections) {
  for (u = 0; u < sections.length; u++) {
    console.log("u: " + u);
    console.log(sections);
    console.log("section: " + sections[u]);
    course_index = u;
    section_index = sections[u];
    checkSection(course_index, section_index);
  }
}
function checkSection(index, section_number) {
  console.log("index" + index + ", section: " + section_number);
  checkbox = document.evaluate(
    "/html/body/div[1]/table/tbody/tr[" +
      (index + 1) +
      "]/td[3]/table/tbody/tr[" +
      (section_number + 1) +
      "]/td[4]/input",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
  if (checkbox.checked) {
    checkbox.click();
  }
  checkbox.click();
}
