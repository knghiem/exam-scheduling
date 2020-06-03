var SENIOR_CLASS = "19";
var color_list=['#CCCCCC','#FFB68C','#FFDF3F','#6CD8B8','#F291E2'];
var graph = {};
var courseObjListFull = {};
var courseObjList = {};
var enrollment = {};
var numColors = 1;
var temp;
var contentArray = {};

function processing() {
    document.getElementById("loader-container").style.display = "block";
    document.getElementById("main-page").style.display = "none";
}

// read uploaded files from preview table modal
function readFilesModal(ev) {
    // Retrieve all the files from the FileList object
    var files = ev.target.files;
    var length = ev.target.files.length;
    var tempArray = [];
    if (length!=0) {
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = (function (f) {
              return function (e) {
                var contents = e.target.result;
                //console.log(contents);
                tempArray.push([f, contents]);
                if(tempArray.length==length){
                  readAllTxtModal(tempArray);
                  //console.log("here")
                };
              };
            })(f, i);
            reader.readAsText(f);
        }
    } else {
        alert("No files loaded");
    }
}

// read files from upload
function readFiles(ev) {
    contentArray = [];
    // Retrieve all the files from the FileList object
    var files = ev.target.files;
    var button = ev.target.id;
    var method;
    console.log("button: ", button);
    if (button == "upload"){
      method = "create";
    }
    else if (button == "add-btn"){
      method = "update";
    }
    else {
      method = "invalid";
    }
    length = ev.target.files.length;
    if (length!=0) {
        processing();
        for (var i = 0, f; f = files[i]; i++) {
            //console.log(f.name);
            var reader = new FileReader();
            reader.onload = (function (f, i) {
              return function (e) {
                var contents = e.target.result;
                //console.log(contents);
                contentArray.push(contents);
                if(contentArray.length==length){
                  readAllTxt(contentArray, method);
                  //console.log("here")
                };
              };
            })(f, i);
            reader.readAsText(f);
        }
        ev.target.nextElementSibling.nextElementSibling.innerHTML=ev.target.files.length.toString()+" file(s) selected";
    } else {
        alert("No files loaded");
    }
}

// read each individual file
// returns a list of course names and a list of student ID's
function readTxt(file) {
	lines = file.trim().split("\n");
	labels = lines[0].trim().split("\t");

	for (var i = 0; i < labels.length; i++){
    if (labels[i].includes("PIDM")){
      var id = i;
		}
    else if (labels[i].includes("CLAS_CODE")) {
      var cy = i;
    }
    else if (labels[i].includes("CRN_KEY")) {
      var crn = i;
    }
    else if (labels[i].includes("SECTION")) {
      var sec = i;
    }
    else if (labels[i].includes("SUB")){
      var sub = i;
		}
    else if (labels[i].includes("COURSE")){
      var num = i;
		}
	}

  // Reading the first record
	var rec = lines[1].trim().split('\t');

  // flag = True if there is a senior in the course
  var flag = false;
  var studentList = [];
  var seniorList= [];
  studentList.push(rec[id]);

  if (rec[cy]==SENIOR_CLASS){
    flag = true;
    seniorList.push(rec[id]);
  }

  if (rec[sec]!='1'){
    var name = rec[sub]+' '+rec[num]+'-'+rec[sec];
  }
  else{
    var name = rec[sub]+' '+rec[num];
  }

  var conflict = new Object;

	if (lines.length < 3){
    return {'crn':rec[crn], 'sub':rec[sub], 'num':rec[num], 'name': name, 'studentList': studentList, 'hasSenior':flag, 'seniorList':seniorList, 'conflict': conflict, 'section':rec[sec]};
	}

  for (var k = 2; k < lines.length; k++){
      rec = lines[k].trim().split('\t')
      studentList.push(rec[id])

      if (rec[cy]==SENIOR_CLASS){
        flag = true;
        seniorList.push(rec[id]);
      }
	}
  return {'crn':rec[crn], 'sub':rec[sub], 'num':rec[num], 'name': name, 'studentList': studentList, 'hasSenior':flag, 'seniorList':seniorList, 'conflict': conflict, 'section':rec[sec]};

}

// read content of all text files and add courses to the preview table
function readAllTxtModal(array){
  document.getElementById("filesTable").style.display="";
  var table = "";
  var alertStr = "";
	for (var i = 0, f; f=array[i]; i++){
    var result = readTxt(f[1]);
    var name = result['name'];
    var section = result['section'];
    if (typeof courseObjListFull[result['crn']] == "undefined"){
      contentArray[result['crn']] = f;
      courseObjListFull[result['crn']] = result;
      table += "<tr id=row"+result['crn']+"><td>"+f[0].name+"</td><td>"+name+"</td><td>"+section.toString()+"</td><td><span class='deleteRowBtn fa fa-trash-alt' onclick=deleteRow(this)></span></td></tr>";
    }
    else {
      alertStr += f[0].name+" has already been added as "+name+"\n";
    }
    if (i==(array.length-1)){
      document.getElementById("filesResult").innerHTML = table+document.getElementById("filesResult").innerHTML;
      if (alertStr.length > 0){
        alert(alertStr);
      }
    }
	}
}

// delete a row from the preview table
function deleteRow(i){
  var row = i.parentNode.parentNode;
  var crn = row.id.substring(3);
  delete courseObjListFull[crn];
  var table = row.parentNode;
  table.removeChild(row);
}

// when user creates a new crosslist, show the courses to combine
function newCrosslist(){
  // await for return to reinforce order of execution
  var flag = createSelect();
  updateSelect(flag)
}

// create checkboxes to combine courses for cross-listing
function createSelect(){
  var content = '<br></br><div class="dropdown bootstrap-select show-tick fit-width"><select class="selectpicker" data-live-search="true" data-live-search-placeholder="Search" data-width="fit" multiple="multiple">';
  var courses = keysToList(courseObjListFull);
  for (var i=0, c; c=courses[i]; i++){
    content += "<option value='"+courseObjListFull[c]['crn']+"'>"+courseObjListFull[c]['name']+"</option>";
  }
  content += '</select></div><br></br>';
  var elements = htmlToElements(content);
  for (var k=0, e; e=elements[k]; k++){
    document.getElementById('crosslist-container').append(e);
  }
  return true;
}

// update all the selected checkboxes
function updateSelect(flag){
  console.log("updated selected");
  $('.selectpicker').selectpicker();
}

// arguments: reference to select list, callback function (optional)
function getSelectedOptions(sel, fn) {
    var opts = [], opt;

    // loop through options in select list
    for (var i=0, len=sel.options.length; i<len; i++) {
        opt = sel.options[i];
        // check if selected
        if ( opt.selected ) {
            // add to array of option elements to return from this function
            opts.push(opt);
            // invoke optional callback function if provided
            if (fn) {
                fn(opt);
            }
        }
    }
    // return array containing references to selected option elements
    return opts;
}

// interface to link selected crosslisted courses
function linkCourses(){
  // callback fn handles selected options
  courseObjList = JSON.parse(JSON.stringify(courseObjListFull));
  for (var i=0, s; s=$('.selectpicker')[i]; i++){
    var opts = getSelectedOptions(s, function(opt){
      console.log(opt.value);
      delete courseObjList[opt.value];
    });
    var result = createCrosslist(opts);
    var crosslistName = result[0];
    var data = result[1]
    courseObjList[crosslistName] = data;
  }
  var enrollment = {};

  for (var j=0, c; c=Object.keys(courseObjList)[j]; j++){
    // Adding studentList to the enrollment dictionary
    enrollment[courseObjList[c]['crn']] = courseObjList[c]['studentList'];
    console.log('enrollment', enrollment);
	}

  setTimeout(function(){
    processing();
    setTimeout(function(){
      document.getElementById("loader-container").style.display = "none";
      document.getElementById("main-page").style.display = "block";
      // create the graph
      createGraph(enrollment);
    }, 1000);
  }, 1000);
}

// Create cross-listed courses
function createCrosslist(opts){
  var crosslist = ""
  for (var i=0, c; c=opts[i]; i++){
    crosslist += c.value;
  }

  //{'crn':rec[crn], 'sub':rec[sub], 'num':rec[num], 'name': name, 'studentList': studentList, 'hasSenior':flag, 'seniorList':seniorList, 'conflict': conflict, 'section':rec[sec]};
  var crn = "";
  var sub = "Other";
  var num = "Other";
  var name = "";
  var studentList = [];
  var hasSenior = false;
  var seniorList = [];
  var conflict = {};
  var sec = "Other";
  for (var k=0, c1; c1=opts[k]; k++){
    var c = c1.value;

    // crosslist CRN = combination of indv courses' CRNs
    crn += courseObjListFull[c]['crn'];
    // crosslist names = combination of indv courses' names
    name += courseObjListFull[c]['name'];

    if (k<opts.length-1){
      name += '/';
    }
    for (var g=0, s; s=courseObjListFull[c]['studentList'][g]; g++){
      studentList.push(s);
    }
    if (courseObjListFull[c]['hasSenior'] == true){
      hasSenior = true;
    }
    console.log(studentList)
    for (var h=0, s; s=courseObjListFull[c]['seniorList'][h]; h++){
      seniorList.push(s);
    }

    for (var j=0, c2; c2=Object.keys(courseObjListFull[c]['conflict'])[j]; j++){
      if (!Object.keys(conflict).includes(c2)) {
        conflict[c2]=[] = courseObjListFull[c]['conflict'][c2];
      }
      else {
        for (var t=0, s; s=courseObjListFull[c]['conflict'][c2][t]; t++){
          if(!conflict[c2].includes(s)){
            conflict[c2].push(s);
          }
        }
      }
    }
    // for (var k=0, c2; c2=Object.keys(courseObjList[c]['conflict'])[k]; k++){
    //   if (!Object.keys(conflict).includes(c2)){
    //     conflict.push(c2);
    //   }
    // }
  }
  return [crosslist, {'crn':crn, 'sub':sub, 'num':num, 'name': name, 'studentList': studentList, 'hasSenior':hasSenior, 'seniorList':seniorList, 'conflict': conflict, 'section':sec}];
}

// Sort the preview course table 
function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("filesTable");
  switching = true;
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName("TR");
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[1];
      y = rows[i + 1].getElementsByTagName("TD")[1];
      //check if the two rows should switch place:
      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        //if so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

// read input text files, callback function depends on "method" (create new/update)
function readAllTxt(array, method){
	enrollment = {};
  var courseObjListCopy = {}
  if (method=="update"){
    courseObjListCopy = Object.assign({}, courseObjList);
  }
	for (var i = 0, f; f=array[i]; i++){
    var result = readTxt(f);
    var crn = result['crn']

    // Adding studentList to the enrollment dictionary
    enrollment[crn] = result['studentList'];

    // Adding a new coourse object to the courseObjList
    courseObjList[crn] = result;
	}
  setTimeout(function(){
    document.getElementById("loader-container").style.display = "none";
    document.getElementById("main-page").style.display = "block";
    if (method=="create"){
      createGraph(enrollment);
    }
    else if (method=="update"){
      updateGraph(courseObjListCopy);
    }
  }, 1000);
}


/*
 * @param {String} HTML representing any number of sibling elements
 * @return {NodeList}
 */
function htmlToElements(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
}

/*
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

// add an extra time slot without creating a new row
function addTime(){
  var numSlots = document.getElementsByClassName('time').length;
  // Adding a single time slot card

	var rows = document.getElementsByClassName("time-row");
  for (var k = 0; k<rows.length; k++) {
		row2 = rows[k].childNodes[1];
		row3 = rows[k].childNodes[2];
    if ((row2==undefined) || (row3==undefined)){
      contents ='<div class="col-sm-4">'+
                  '<div class="card time" id="slot'+(numSlots+1).toString()+'">'+
                    '<div class="card-body">'+
                      '<h5 class="card-title time-name" contenteditable="true"><span class="fa fa-edit" contenteditable="false"></span>New Time</h5>'+
                      '<p style="text-align:right; margin-top:-20px"><span onclick="deleteTime(this)" class="fa fa-times"></span></p>'+
                      '<div class="dropzone"></div>'+
                    '</div>'+
                  '</div>'+
                '</div>';
      timeslot = htmlToElement(contents);
      rows[k].appendChild(timeslot);
      timeEventHandler(timeslot);
      temp = timeslot;
      return;
    }
  }
  // Adding a new row with a time slot card
    contents ='<div class="row time-row extra-time">'+
                '<div class="col-sm-4">'+
                  '<div class="card time" id="slot'+(numSlots+1).toString()+'">'+
                    '<div class="card-body">'+
                      '<h5 class="card-title time-name" contenteditable="true"><span class="fa fa-edit" contenteditable="false"></span>New Time</h5>'+
                      '<p style="text-align:right; margin-top:-20px"><span onclick="deleteTime(this)" class="fa fa-times"></span></p>'+
                      '<div class="dropzone"></div>'+
                    '</div>'+
                  '</div>'+
                '</div>'+
              '</div>';
    timeslot = htmlToElement(contents);
    document.getElementById('time-slot-container').appendChild(timeslot);
    timeEventHandler(timeslot.childNodes[0]);
}

// Add an extra time slot that creates a new row
function addTime2(id, time, a){
	var rows = document.getElementsByClassName("time-row");
    for (var k = 0; k<rows.length; k++) {
  		row2=rows[k].childNodes[1];
  		row3=rows[k].childNodes[2];
      if ((row2==undefined) || (row3==undefined)){
        contents ='<div class="col-sm-4">'+
                    '<div class="card time" id="'+id+'">'+
                      '<div class="card-body">'+
                        '<h5 class="card-title time-name" contenteditable="true"><span class="fa fa-edit" contenteditable="false"></span>'+time+'</h5>'+
                        '<p style="text-align:right; margin-top:-20px"><span onclick="deleteTime(this)" class="fa fa-times"></span></p>'+
                        '<div class="dropzone"></div>'+
                      '</div>'+
                    '</div>'+
                  '</div>';
        var timeslot = htmlToElement(contents);
        rows[k].appendChild(timeslot);
        timeEventHandler(timeslot);
        var cards = createCourseCards(a);
        addToContainer(cards, timeslot.childNodes[0].childNodes[0].childNodes[2]);
        return true;
      }
    }
  // Adding a new row with a time slot card
    contents ='<div class="row time-row extra-time">'+
                '<div class="col-sm-4">'+
                  '<div class="card time" id="'+id+'">'+
                    '<div class="card-body">'+
                      '<h5 class="card-title time-name" contenteditable="true"><span class="fa fa-edit" contenteditable="false"></span>'+time+'</h5>'+
                      '<p style="text-align:right; margin-top:-20px"><span onclick="deleteTime(this)" class="fa fa-times"></span></p>'+
                      '<div class="dropzone"></div>'+
                    '</div>'+
                  '</div>'+
                '</div>'+
              '</div>';
    var timeslot = htmlToElement(contents);
    document.getElementById('time-slot-container').appendChild(timeslot);
    timeEventHandler(timeslot.childNodes[0]);
    var cards = createCourseCards(a);
    addToContainer(cards, timeslot.childNodes[0].childNodes[0].childNodes[0].childNodes[2]);
}

/*
var modalConfirm = function(callback, time){
  $("#confirm-modal").modal('show');
  $("#confirm-modal-yes").on("click", function(){
    callback(time);
    $("#confirm-modal").modal('hide');
  });
};
*/

// delete a time slot
function deleteTime(deleteBtn){
  console.log(deleteBtn);
  courses = deleteBtn.parentNode.nextElementSibling.childNodes;
  console.log(courses);
  for (var i=(courses.length-1), c; c=courses[i]; i--){
    document.getElementById('course-list').appendChild(c)
  }
  col = deleteBtn.parentNode.parentNode.parentNode.parentNode;
  row = col.parentNode;
  row.removeChild(col);
  if (row.childNodes.length==0){
    row.parentNode.removeChild(row);
	  return
  }
	shuffleBack(row)
}

// recursive utility function to remove row
function shuffleBack(row){
	nextRow=row.nextElementSibling
	if ((nextRow==null) || (row.childNodes[2]!=undefined)){
		return
	}
	for (var k = 0; k<nextRow.childNodes.length; k++) {
		if(nextRow.childNodes[k]!=undefined){
			row.appendChild(nextRow.childNodes[k])
			if (nextRow.childNodes.length==0){
    			nextRow.parentNode.removeChild(nextRow);
  			}
			else{
				shuffleBack(row)
				shuffleBack(nextRow)
			}
		}
			break
	}
}

// Create course cards from coloring assignment
function createCourseCards(a){
  var cards = [];
  if (Object.keys(courseObjList).length > 0){
    console.log("courseObjList");
    console.log(courseObjList);
    console.log(a);
    for (var k=0, el; el = a[k]; k++) {
      console.log(el);
      var rec = courseObjList[el];
      console.log(rec);
      contents ='<div class="course-test" id="'+rec['crn']+'">'+
              '<div>'+
                '<span>'+rec['name']+'</span>'+
              '</div>'+
            '</div>';
      card = htmlToElement(contents)
      if (document.getElementById(rec['name'])){
        console.log('Course has already been added');
      }
      else{
        //document.getElementById('course-list').appendChild(card)
        card.setAttribute('draggable', true);
        var i = parseInt(rec['color']);
        card.style.backgroundColor=color_list[i];
        //events fired on the draggable target
        card.addEventListener("dragstart", function( ev ) {
          //console.log(ev.target.id);
          ev.dataTransfer.setData("text", ev.target.id);
          checkConflicts(ev.target.id);
        }, false);
        cards.push(card);
      }
    }
  }
  return cards;
}

// create courses from coloring assignments
function createCourses(){
  var a = [];
  var tem = schedule(createBlocks);
  var coloring = tem[0];
  var free = tem[1];
  for (var el in coloring) {
    var courses = coloring[el];
    for (var i=0, crn; crn=courses[i]; i++) {
      a.push(crn);
      courseObjList[crn]['color'] = el;
    }
  }
  for (var i=0, crn; crn=free[i]; i++) {
    a.push(crn);
    courseObjList[crn]['color'] = 0;
  }
  var cards = createCourseCards(a);
  addToContainer(cards, document.getElementById('course-list'));
}

// add card courses to time slot containers
function addToContainer(a, container){
  for (var i=0, card; card = a[i]; i++) {
    container.appendChild(card)
  }
}

// utility function
function graphToList(graph) {
  var result = [];
  for (var el in graph) {
    result.push([el,graph[el]]);
  }
  return result
}

// Welsh Powell
function Welsh_Powell(graph) {
  var graph_list = graphToList(graph);
  // sort the list by descending degree
  graph_list.sort(function(a, b){return b[1].length - a[1].length});
  // get the set of vertices in order
  var V = []
  for (var i=0, el; el=graph_list[i]; i++) {
    V.push(el[0]);
  }
  // initiate result coloring dict, with vertices as keys
  coloring = {}
  // traverse the list and color the graphics
  for (var i=0, v; v=V[i]; i++){
    // if the vertex has not been colored
    if (typeof coloring[v] == "undefined") {
      // assign the first available color
      coloring[v] = numColors;
      // increment the count of colors
      numColors++;
      // traverse the list V and assign the same colors to non-neighbors of v
      for (var k=i+1, v_prime; v_prime=V[k]; k++) {
        if ((typeof coloring[v_prime] == "undefined") && !(graph[v].includes(v_prime))) {
          // check if any neighbor of v_prime is of the same color as v
          // assume there is none (which means we could still color v_prime the same as v)
          var flag = false;
          // get all neighbors of v_prime
          var neighbors = graph[v_prime];
          // if a neighbor of v_prime has the same color as v, flag = True
          for (var g=0, n; n=neighbors[g]; g++){
            if ((typeof coloring[n] != "undefined") && (coloring[n]==coloring[v])) {
              flag = true;
            }
          }
          // if v_prime doesn't have any neighbor of the same color as v
          // color v_prime as v
          if ( flag==false ){
            coloring[v_prime] = coloring[v];
          }
        }
      }
    }
  }
  //console.log(coloring);
  return coloring;
}

// Call back function cb is createBlock
// From the results of Welsh Powell,
// assign colors for courses with conflicts
// and put courses with no conflicts in a list called "free"
function schedule(cb){
  graphCopy = {};
  var free = [];
  var V = Object.keys(graph);
  for (var i=0, v; v=V[i]; i++){
    graphCopy[v] = graph[v];
    if(graph[v].length==0) {
      free.push(v);
      delete graph[v];
    }
  }
  coloring = Welsh_Powell(graph);
  //console.log(coloring, free);
  //callback function = createBlock
  var blocks = cb(coloring);
  console.log("Blocks: ", blocks)
  return [blocks, free];
}

// assign colors to groups of courses with no conflicts
function createBlocks(coloring){
  // if there is no conflicts
  if (Object.keys(coloring).length == 0){
    // no colors needed
    dict = {};
    return dict;
  }
  else {
    coloring_list = graphToList(coloring);
    coloring_list.sort(function(a, b){return a[1] - b[1]});
    //console.log(coloring_list);
    dict = {};
    c = coloring_list[0][1];
    for (var i=0, el; el = coloring_list[i]; i++){
      if (el[1] != c){
        c = el[1];
      }
      if (typeof dict[c] == "undefined"){
        dict[c] = [];
      }
      dict[c].push(el[0])
    }
	//console.log (dict)
    return dict;
  }
}

// utility function
function keysToList(dict) {
  var result=[];
  for (var el in dict){
    result.push(el);
  }
  return result;
}

// create the graph from the list of courses and students
function createGraph(enrollment){
  if (Object.keys(graph).length==0){
    courses = keysToList(enrollment);
    //console.log(courses);

    for (var i=0; i<(courses.length); i++){
      graph[courses[i]]=[];
    }
    for (var i=0; i<(courses.length-1); i++){
      for (var k=i+1; k<courses.length; k++){
        c1 = courses[i];
        c2 = courses[k]
        for (var i1=0, s1; s1=enrollment[c1][i1]; i1++){
          for (var i2=0, s2; s2=enrollment[c2][i2]; i2++){
            if ((s1==s2) && (!(graph[c1].includes(c2)))){
              graph[c1].push(c2);
              graph[c2].push(c1);

              courseObjList[c1]['conflict'][c2]=[];
              courseObjList[c1]['conflict'][c2].push(s1);
              courseObjList[c2]['conflict'][c1]=[];
              courseObjList[c2]['conflict'][c1].push(s1);
            }
            else if ((s1==s2) && (graph[c1].includes(c2))){
              courseObjList[c1]['conflict'][c2].push(s1);
              courseObjList[c2]['conflict'][c1].push(s1);
            }
          }
        }
      }
    }
    console.log('graph: ',graph);
    createCourses();
  }
  else{
    alert('Error, graph is not empty');
  }
}

// update the graph when new courses are added
function updateGraph(courseObjListCopy){
  //get the new courses to be added to the graph
  courses = keysToList(enrollment);
  //console.log(courses);

  //create the vertices for the new courses
  for (var i=0; i<(courses.length); i++){
    if (typeof graph[courses[i]] == "undefined"){
        graph[courses[i]]=[];
    }
    else {
      alert(couses[i]+" has already beed added");
    }
  }
  var oldCourses = keysToList(courseObjListCopy);
  freeCoursesToColor = [];

  //update the graph by adding edges
  for (var i=0; i<(courses.length); i++){
    //adding edges between new vertices and old vertices
    for (var k=0; k<oldCourses.length; k++){
      var c1 = courses[i];
      var c2 = oldCourses[k];
      for (var i1=0, s1; s1=courseObjList[c1]['studentList'][i1]; i1++){
        for (var i2=0, s2; s2=courseObjList[c2]['studentList'][i2]; i2++){
          if ((s1==s2) && (Object.keys(courseObjList[c2]['conflict']).length==0)){
            freeCoursesToColor.push(courseObjList[c2]);
            graph[c2] = [];
          }
          if ((s1==s2) && (!(graph[c1].includes(c2)))){
            graph[c1].push(c2);
            graph[c2].push(c1);

            courseObjList[c1]['conflict'][c2]=[];
            courseObjList[c1]['conflict'][c2].push(s1);
            courseObjList[c2]['conflict'][c1]=[];
            courseObjList[c2]['conflict'][c1].push(s1);
          }
          else if ((s1==s2) && (graph[c1].includes(c2))){
            courseObjList[c1]['conflict'][c2].push(s1);
            courseObjList[c2]['conflict'][c1].push(s1);
          }
        }
      }
    }
  }
  for (var i=0; i<(courses.length-1); i++){
    //adding edges between new edges
    for (var g=i+1; g<courses.length; g++){
      var c1 = courses[i];
      var c2 = courses[g]
      for (var i1=0, s1; s1=courseObjList[c1]['studentList'][i1]; i1++){
        for (var i2=0, s2; s2=courseObjList[c2]['studentList'][i2]; i2++){
          if ((s1==s2) && (!(graph[c1].includes(c2)))){
            graph[c1].push(c2);
            graph[c2].push(c1);

            courseObjList[c1]['conflict'][c2]=[];
            courseObjList[c1]['conflict'][c2].push(s1);
            courseObjList[c2]['conflict'][c1]=[];
            courseObjList[c2]['conflict'][c1].push(s1);
          }
          else if ((s1==s2) && (graph[c1].includes(c2))){
            courseObjList[c1]['conflict'][c2].push(s1);
            courseObjList[c2]['conflict'][c1].push(s1);
          }
        }
      }
    }
  }
  var a = [];
  for (var i=0; i<(courses.length); i++){
    var current = courseObjList[courses[i]];
    if (Object.keys(current['conflict']).length==0){
      current['color'] = 0;
      a.push(current['crn']);
    }
    else {
      for (var c=1; c<numColors+2; c++){
        //check if the color is feasible
        var flag = true;
        for (var g=0, conflict; conflict= Object.keys(current['conflict'])[g]; g++){
          //if there is a conflict course with that color
          if (courseObjList[conflict]['color']==c){
            flag = false;
          }
        }
        if (flag==true){
          current['color']=c;
          a.push(current['crn']);
          break;
        }
      }
    }
    if (i==courses.length-1){
      var cards = createCourseCards(a);
      addToContainer(cards, document.getElementById('course-list'));
    }
  }
  for (var h=0, current; current = freeCoursesToColor[h]; h++){
    console.log("here", freeCoursesToColor);
    for (var c=1; c<color_list.length; c++){
      //check if the color is feasible
      var flag = true;
      for (var g=0, conflict; conflict= Object.keys(current['conflict'])[g]; g++){
        //if there is a conflict course with that color
        if (courseObjList[conflict]['color']==c){
          //console.log(conflict, "has color", c)
          flag = false;
        }
      }
      if (flag==true){
        //recolor
        current['color']=c;
        var name = current['name'];
        //console.log(name, "recolored to be", c);
        var el = document.getElementById(name);
        el.style.backgroundColor=color_list[c];
        break;
      }
    }
  }
}

// Highlight red the time slots that contain 
// courses with conflicts with the current course 
function checkConflicts(course){
  // conflicts is a list of courses that conflict with course
  if (typeof courseObjList[course]!= "undefined"){
    var conflicts = Object.keys(courseObjList[course]['conflict']);
    for (var i = 0, c; c = conflicts[i]; i++){
      container = document.getElementById(c).parentNode.parentNode.parentNode;
      if (container.classList.contains("time")){
        container.style.boxShadow="0 0 5px #FF0000";
      }
    }
  }
}

// Handle drag and drop for time slots
function timeEventHandler(t){
  // events fired on the drop targets
  t.addEventListener("dragover", function( ev ) {
    // prevent default to allow drop
    ev.preventDefault();
  }, false);
  t.addEventListener("dragenter", function( ev ) {
    // highlight potential drop target when the draggable element enters it
    if (ev.target.className=="dropzone"){
      if (ev.target.parentNode.parentNode.style.boxShadow==""){
        ev.target.parentNode.style.boxShadow="0 0 5px #0000FF";
      }
    }
  }, false);
  t.addEventListener("dragleave", function( ev ) {
    // reset background of potential drop target when the draggable element leaves it
    ev.target.parentNode.style.boxShadow="";
  }, false);
  t.addEventListener("dragend", function( ev ) {
    var slots = document.getElementsByClassName("dropzone");
    for (var k = 0, t; t = slots[k]; k++) {
      t.parentNode.style.boxShadow="";
      t.parentNode.parentNode.style.boxShadow="";
    }
  }, false);
  t.addEventListener("drop", function( ev ) {
    // prevent default action (open as link for some elements)
    ev.preventDefault();
    // move dragged elem to the selected drop target           
    var data = ev.dataTransfer.getData("text");
    var flag = true;
    if(ev.target.className!="dropzone"){
      flag = false;
    }
    if (typeof graph[data] != "undefined"){
      var conflicts = graph[data];
      for (var i = 0, c; c = conflicts[i]; i++){
        container = document.getElementById(c).parentNode;
        //console.log('container: ',container)
        if (container == ev.target && container.id != "course-list"){
          flag = false;
        }
      }
    }
    if(flag) {
      ev.target.appendChild(document.getElementById(data));
    }
  }, false)
}

// Prompt the user to download the file "fname" which contains
// the input string "text" in the specified "format" (plain text/JSON)
function download(fname, format, text){
  var element = document.createElement('a');
  element.setAttribute("href", "data:text/"+format+";charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", fname);
  element.style.display = 'none';

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// // [Deprecated] Function to export the schedule to a report web page
// function exportToWeb() {
//   var scheduleOut = {};
//   var slots = document.getElementsByClassName("time");
//   for (var i = 0, t; t = slots[i]; i++) {
//     var id = t.id;
//     if (i<6){
//       var label=t.childNodes[1].childNodes[1].innerHTML;
//       var courses=t.childNodes[1].childNodes[3].childNodes;
//     }
//     else{
//       var label=t.childNodes[0].childNodes[0].innerHTML;
//       var courses=t.childNodes[0].childNodes[2].childNodes;
//     }

//     var tem=label.trim().split(">");
//     var time=tem[2];

//     scheduleOut[id] = {};
//     scheduleOut[id]["time"]=time;
//     scheduleOut[id]["courses"]=[];

//     if (courses.length>0){
//       for (var k = 0; k<(courses.length); k++){
//         scheduleOut[id]["courses"].push(courses[k].id)
//       }
//     }
//   }
//   console.log(scheduleOut);

//   var scheduleHTML = "";
//   for (var el in scheduleOut) {
//     var slot = scheduleOut[el];
//     var time = slot["time"];
//     var courses = slot["courses"];

//     scheduleHTML += "<h2>"+time+"</h2>";
//     for (var i=0, c; c=courses[i]; i++) {
//       scheduleHTML += "<p>"+c+"</p>";
//     }
//   }

//   var date = new Date();

//   var w = window.open("");
//   var content = "<html>"+
//                   "<head>"+
//                     '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB" crossorigin="anonymous">'+
//                     "<title>Schedule</title>"+
//                   "</head>"+
//                   "<body>"+
//                     '<main role="main" class="container">'+
//                         '<p style="margin-top: 5px;">Report created at: '+date.toLocaleTimeString()+', '+date.toDateString()+'</p>'+
//                         '<h1 style="margin-top:50px; text-align:center">Final Exam Schedule</h1>'+
//                         scheduleHTML+
//                     '</main>'+
//                   "</body>"+
//                 "</html>";
//   w.document.writeln(content);
// }

// Export the current schedule to a text file
function outputSchedule(){
	var outputGraph={};
	var slots = document.getElementsByClassName("time");
    for (var k = 0, t; t = slots[k]; k++) {
      var id = t.id;
  		if (k<6){
  			rawtext=t.childNodes[1].childNodes[1].innerHTML;
  			classes=t.childNodes[1].childNodes[3].childNodes;
  		}
  		else{
  			rawtext=t.childNodes[0].childNodes[0].innerHTML;
  			classes=t.childNodes[0].childNodes[2].childNodes;
  		}
  		splittext=rawtext.trim().split(">");
  		text=splittext[2]

      outputGraph[id]={};
  		outputGraph[id]["time"]=text;
      outputGraph[id]["courses"]=[];

  		if (classes.length>0){
  			for (var i = 0; i<(classes.length); i++){
  			outputGraph[id]["courses"].push(classes[i].id)
  			}
  		}
    }
  var outputTxt=''
  for (el in outputGraph){
    for (ele in outputGraph[el]){
      if (ele==0){
        outputTxt+='\n \r'+outputGraph[el][ele]+':\n \r'
      }
      else{
      outputTxt+=outputGraph[el][ele]+'\n \r'
    }
    }
  }
	fname = 'Schedule'+'.txt';
 format = "plain";
 download(fname, format, outputTxt);
}

// Save the draft schedule into a JSON file 
// Send the JSON to the download function to save to user's computer
function save() {
  // initiate an empty JSON object to store all data
  var timeObjList = {};

  // grab data from all the time slots on the page
  var slots = document.getElementsByClassName("time");
  for (var i = 0, t; t = slots[i]; i++) {
    var id = t.id;
    // getting the label for the time slot and all its courses
    // default 6 slots
    if (i<6){
      var label=t.childNodes[1].childNodes[1].innerText;
      var courses=t.childNodes[1].childNodes[3].childNodes;
    }
    // extra slots created
    else{
      var label=t.childNodes[0].childNodes[0].innerText;
      var courses=t.childNodes[0].childNodes[2].childNodes;
    }

    // create the entry for the time slot in the JSON storage object
    timeObjList[id] = {};
    timeObjList[id]["time"]=label;
    timeObjList[id]["courses"]=[];

    // push data in the time slot
    if (courses.length>0){
      for (var k = 0; k<(courses.length); k++){
        timeObjList[id]["courses"].push(courses[k].id)
      }
    }
  }

  // store the unscheduled courses (courses not in time slots)
  timeObjList["not-scheduled"] = [];
  var container = document.getElementById('course-list');
  var courses = container.childNodes;
  if (courses.length>1){
    for (var k=1; k<(courses.length); k++){
      timeObjList["not-scheduled"].push(courses[k].id);
    }
  }

  // capture the current timestamp
  var date = new Date();
  var y = date.getFullYear();
      m = date.getMonth();
      d = date.getDate();
      h = date.getHours();
      min = date.getMinutes();
      fname = m+'-'+d+'-'+y+'--'+h+'-'+min+'.json';
      format = "json";
  var content = {courseObjList, timeObjList};

  // save the JSON storage with the name as current timestamp
  download(fname, format, JSON.stringify(content, null, '\t'));
}

// Load draft schedule from a JSON file
function load(ev){
  // Retrieve all the files from the FileList object
  var f = ev.target.files[0];
  console.log("f:", f);
  var reader = new FileReader();
  reader.onload = (function (file) {
    return function (e) {
      var json = JSON.parse(e.target.result);
      console.log(json);
      // Call the function to populate the page after reading the JSON file of draft schedule
      buildPage(json);
  	}
  })(f);
  reader.readAsText(f);
}

// Populate the page with draft schedule from upload json
function buildPage(json){
  document.getElementById('course-list').innerHTML="";
  document.getElementById('time-slot-container').innerHTML="";
  courseObjList = json["courseObjList"];
  console.log("Here", json['timeObjList']['not-scheduled']);
  var cards = createCourseCards(json['timeObjList']['not-scheduled']);
  addToContainer(cards, document.getElementById('course-list'));
  var timeObjList = json['timeObjList'];
  for (var el in timeObjList) {
    if (el != 'not-scheduled'){
      addTime2(el, timeObjList[el]['time'], timeObjList[el]['courses']);
    }
  }
}


window.onload = function(){
  // $(function () {
  //   $('[data-toggle="popover"]').popover()
  // })

//readFilesModal
// anonymous function onchange for select list with id demoSel
  document.getElementById('generate-btn').addEventListener('click', linkCourses, false);
  document.getElementById('new-crosslist-btn').addEventListener('click', newCrosslist, false);
  document.getElementById('new-files-btn').addEventListener('change', readFilesModal, false);
  document.getElementById('export-btn').addEventListener('click', outputSchedule, false);
  document.getElementById("save-btn").addEventListener("click", save, false);
  document.getElementById("load-btn").addEventListener("change", load, false);
  document.getElementById('upload').addEventListener('change', readFiles, false);
  document.getElementById('add-btn').addEventListener('change', readFiles, false);
  document.getElementById('add-time-btn').addEventListener('click', addTime, false);
  document.getElementById('course-list').addEventListener('DOMNodeInserted',
                      function(){
                        //console.log(this.childNodes);
                        document.getElementById('num-course').innerHTML = (this.childNodes.length-1).toString()+' course(s) to be scheduled';
                      }, false);
  document.getElementById('course-list').addEventListener('DOMNodeRemoved',
                      function(){
                        //console.log(this.childNodes);
                        document.getElementById('num-course').innerHTML = (this.childNodes.length-2).toString()+' course(s) to be scheduled';
                        }, false);

  var slots = document.getElementsByClassName("dropzone");
  for (var k = 0, t; t = slots[k]; k++) {
    timeEventHandler(t);
  }
}
