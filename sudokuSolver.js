
function CreateMatrix(h, w) {
    var m = new Array(h);
    for (var i = 0; i < h; i++) {
        m[i] = new Array(w);
        for (var j = 0; j < w; j++) {
            m[i][j] = 0;
        }
    }
    return m;
}

function RemoveFromList(l, v) {
    var index = l.indexOf(v);
    if (index >= 0) {
        l.splice(index, 1);
    }
    return l;
}

function iteratorForListOfList(l) {
    this.l = l;
    this.position = -1;
    this.numberOfCombinations = 1;
    for (var i = 0; i < this.l.length; i++) {
        this.numberOfCombinations *= this.l[i].length;
    }
}

function integerDivision(up, down) {
    return Math.floor(up / down);
}

function sortIntList(l) {
    return l.sort(function(a, b) {
        return a - b
    });
}

function integerRemainder(up, down) {
    var div = integerDivision(up, down);
    return up - (div * down);
}

iteratorForListOfList.prototype.next = function() {
    this.position++;
    if (this.position >= this.numberOfCombinations) {
        return null;
    }
    var resultL = [];
    var previousSublistLength = 1;
    var positionPerSublist = this.position;
    for (var i = 0; i < this.l.length; i++) {
        positionPerSublist = integerDivision(positionPerSublist, previousSublistLength);
        var positionInSublist = integerRemainder(positionPerSublist, l[i].length);
        resultL.push(l[i][positionInSublist]);
        previousSublistLength = l[i].length;
    }
    return resultL;
}

function IntListMatrix(h, w) {
    this.h = h;
    this.w = w;
    this.m = CreateMatrix(h, w);
}

IntListMatrix.prototype.matrixToString = function(m, h, w) {
    var s = "";
    for (var i = 0; i < h; i++) {
        for (var j = 0; j < w; j++) {
            var n = m[i][j];
            if (n > 0) {
                s += n;
            } else {
                s += ".";
            }
        }
        s += "\n";
    }
    return s;
}

IntListMatrix.prototype.getAt = function(i, j) {
    return this.m[i][j];
}

IntListMatrix.prototype.setAt = function(value, i, j) {
    //console.log("setAt " + i + j + value);
    this.m[i][j] = value;
}

function SudokuMatrix() {
    this.solution = CreateMatrix(9, 9);
    this.candidateList = [];
    this.solutionCandidateIteratorPosition = 0;
    this.acceptable = this.listToBigNumber([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    this.foundSolution = false;
    this.offendingRow = -1;
    this.offendingColumn = -1;
};

SudokuMatrix.prototype = new IntListMatrix(9, 9);
SudokuMatrix.prototype.parent = IntListMatrix.prototype;

SudokuMatrix.prototype.listToBigNumber = function(l) {
    l = sortIntList(l);
    l.reverse();
    var mult = 16;
    var n = l[0];
    for (var k = 1; k < l.length; k++, mult *= 16) {
        n = n + (l[k] * mult);
    }
    return n;
}

SudokuMatrix.prototype.getBigNumberNotation = function(i, j, l) {

    return (this.listToBigNumber(l) * 256) + (i * 16) + j;
}

SudokuMatrix.prototype.coordFromBigNumberNotation = function(n) {
    //console.log("coordFromBigNumberNotation for " +n.toString(16) +  " is " + listToString(l));
    var coord = {
        x: (n >> 4) & 0xf,
        y: n & 0xf
    };
    return coord;
}

SudokuMatrix.prototype.candidatesFromBigNumberNotation = function(n) {
    var originaln = n;
    var l = [];
    n = n >> 8;
    for (; n > 0; n = n >> 4) {
        l.push(n & 0xf);
    }
    //console.log("candidatesFromBigNumberNotation for " +originaln.toString(16) +  " is " + listToString(l));
    return l;
}

SudokuMatrix.prototype.numberOfCandidatesAtPosition = function(position) {
    var l = this.candidatesFromBigNumberNotation(this.candidateList[position]);
    return l.length;
}

SudokuMatrix.prototype.canOccurInQuadrant = function(matrix, v, i, j) {
    var mini = Math.floor(i / 3) * 3;
    var minj = Math.floor(j / 3) * 3;
    //console.log(i + ", " + j + " mini " + mini + " minj " + minj);
    for (var ii = mini; ii < mini + 3; ii++) {
        for (var jj = minj; jj < minj + 3; jj++) {
            //console.log(ii + ", " + jj);
            if (ii != i && jj != j && matrix[ii][jj] > 0) {
                if (matrix[ii][jj] == v) {
                    //console.log("canOccurInQuadrant refused " + v + " in " + ii + "," + jj);
                    return false;
                }
            }
        }
    }
    return true;
}

SudokuMatrix.prototype.canOccurInRow = function(matrix, v, i) {
    for (var j = 0; j < this.w; j++) {
        if (matrix[i][j] == v) {
            //console.log("canOccurInRow refused " + v + " in " + i + "," + j);
            return false;
        }
    }
    return true;
}
SudokuMatrix.prototype.canOccurInColumn = function(matrix, v, j) {
    for (var i = 0; i < this.h; i++) {
        if (matrix[i][j] == v) {
            //console.log("canOccurInColumn refused " + v + " in " + i + "," + j);
            return false;
        }
    }
    return true;
}

SudokuMatrix.prototype.isValueAcceptable = function(m, v, i, j) {
    return this.canOccurInQuadrant(m, v, i, j) &&
        this.canOccurInRow(m, v, i) &&
        this.canOccurInColumn(m, v, j);
}

SudokuMatrix.prototype.isValueAcceptableInM = function(v, i, j) {
    return this.isValueAcceptable(this.m, v, i, j);
}

SudokuMatrix.prototype.isValueAcceptableInSolution = function(v, i, j) {
    return this.isValueAcceptable(this.solution, v, i, j);
}

SudokuMatrix.prototype.getCandidates = function(i, j) {
    if (this.m[i][j] > 0) {
        return [this.m[i][j]];
    }
    var l = [];
    for (var v = 1; v <= 9; v++) {
        if (this.isValueAcceptableInM(v, i, j)) {
            l.push(v);
        }
    }
    return l;
}

function listToString(l) {
    var s = "";
    for (var i = 0; i < l.length; i++) {
        if (s.length > 0) {
            s += ",";
        }
        s += l[i];
    }
    return s;
}

SudokuMatrix.prototype.sortCandidateList = function(l) {
    return l.sort(function(a, b) {
        return SudokuMatrix.prototype.listToBigNumber(a.l) - SudokuMatrix.prototype.listToBigNumber(b.l);
    });
}

SudokuMatrix.prototype.getCandidateList = function(m) {
    this.solutionCandidateIteratorPosition = 0;
    l = [];
    for (var i = 0; i < this.h; i++) {
        for (var j = 0; j < this.w; j++) {
            if (m[i][j] == 0) {
                var candidates = this.getCandidates(i, j);
                l.push({
                    i: i,
                    j: j,
                    l: candidates
                });
            }
        }
    }
    return this.sortCandidateList(l);
}

SudokuMatrix.prototype.calculateNumberOfPossibleSolutions = function(listOfCandidates) {
    var numberOfPossibleSolutions = 1;
    for (var i = 0; i < listOfCandidates.length; i++) {
        numberOfPossibleSolutions *= listOfCandidates[i].l.length;
    }
    return numberOfPossibleSolutions;
}

SudokuMatrix.prototype.candidateListToString = function(l) {
    var s = "";
    for (var i = 0; i < l.length; i++) {
        s += l[i].i + "," + l[i].j + " [" + listToString(l[i].l) + "]\n";
    }
    return s;
}

SudokuMatrix.prototype.candidateListIterator = function(l, position) {

    //console.log("\ncandidateListIterator " + position +"\n" + this.candidateListToString(l)); 
    var resultL = [];
    var previousSublistLength = 1;
    for (var i = 0; i < l.length; i++) {
        position = integerDivision(position, previousSublistLength);
        var positionInSublist = integerRemainder(position, l[i].l.length);
        resultL.push({
            i: l[i].i,
            j: l[i].j,
            v: l[i].l[positionInSublist]
        });
        previousSublistLength = l[i].l.length;
    }
    return resultL;
}

SudokuMatrix.prototype.removeFromListOfCandidates = function(l, v, i, j) {
    for (var k = 0; k < l.length; k++) {
        if (l[k].i == i && l[k].j == j) {
            l[k].l = RemoveFromList(l[k].l, v);
            break;
        }
    }
    return l;
}

SudokuMatrix.prototype.lowHangingFruits = function(m) {
    var l = this.getCandidateList(m);
    var previousSize = 0;
    var countOfFirmNumbers = 0;
    var previousCountOfFirmNumbers = -1;
    while (countOfFirmNumbers != previousCountOfFirmNumbers && l.length > 0) {
        previousCountOfFirmNumbers = countOfFirmNumbers;
        for (var i = 0; i < l.length; i++) {
            if (m[l[i].i][l[i].j] == 0 && l[i].l.length == 1) {
                m[l[i].i][l[i].j] = l[i].l[0];
                countOfFirmNumbers++;
            }
        }
        l = this.getCandidateList(m);
    }
    return m;
}

SudokuMatrix.prototype.printFailedStatus = function(i, j, configuration, m) {
    console.log("-----------\n" + i);
    console.log("Failed at " + i + " " + j + " " + configuration[j].i + "," + configuration[j].j + "=" + configuration[j].v);
    console.log(this.matrixToString(m, this.h, this.w));
    var s = "";
    for (var k = 0; k < configuration.length; k++) { s += configuration[k].i + "," + configuration[k].j + "=" + configuration[k].v + ";"; }
    console.log(s);
}


SudokuMatrix.prototype.alreadyStartedLikeThis = function(badStarts, configuration) {
    for (var i = 0; i < badStarts.length; i++) {
        var isSameAsConfiguration = true;
        for (var j = 0; j < badStarts[i].length; j++) {
            if (badStarts[i][j].i != configuration[j].i ||
                badStarts[i][j].j != configuration[j].j ||
                badStarts[i][j].v != configuration[j].v) {
                isSameAsConfiguration = false;
                break;
            }
        }
        if (isSameAsConfiguration) {
            return true;
        }
    }
    return false;
}

SudokuMatrix.prototype.copyMatrix = function(m) {
    var newM = CreateMatrix(this.h, this.w);
    for (var i = 0; i < this.h; i++) {
        for (var j = 0; j < this.w; j++) {
            newM[i][j] = m[i][j];
        }
    }
    return newM;
}

SudokuMatrix.prototype.checkInitialState = function() {
    for (var i = 0; i < this.h; i++) {
        for (var j = 0; j < this.w; j++) {
            if (this.m[i][j] != 0) {
                var v = this.m[i][j];
                this.m[i][j] = 0;
                if (!this.isValueAcceptableInM(v, i, j)) {
                    this.offendingRow = i;
                    this.offendingColumn = j;
                    return false;
                }
                this.m[i][j] = v;
            }   
        }
    }
    return true;
}


SudokuMatrix.prototype.FindSolution = function() {
    if (!this.checkInitialState()) {
        return false;
    }
    this.m = this.lowHangingFruits(this.m);
    if (this.isMatrixAcceptable(this.m)) {
        this.foundSolution = true;
        return true;
    }
    var l = this.getCandidateList(this.m);
    //console.log(this.candidateListToString(l));
    var badStarts = [];
    var savedM = this.copyMatrix(this.m);
    //console.log("SAVEDM01\n" + this.matrixToString(savedM, 9, 9));
    for (var i = 0; i < this.calculateNumberOfPossibleSolutions(l); i++) {

        var wentThrough = true;
        var configuration = this.candidateListIterator(l, i);
        if (this.alreadyStartedLikeThis(badStarts, configuration)) {
            continue;
        }
        var m = this.m;
        var start = [];
        for (var j = 0; j < configuration.length; j++) {
            start.push(configuration[j]);
            if (m[configuration[j].i][configuration[j].j] == 0) {
                if (this.isValueAcceptable(m, configuration[j].v, configuration[j].i, configuration[j].j)) {
                    m[configuration[j].i][configuration[j].j] = configuration[j].v;
                    m = this.lowHangingFruits(m);
                    l = this.getCandidateList(m);
                    //console.log(this.matrixToString(m, 9, 9));
                } else {
                    if (integerRemainder(i, 1000) == 0) {
                        this.printFailedStatus(i, j, configuration, m);
                    }
                    if (j === 0) {
                        l = this.removeFromListOfCandidates(l, configuration[j].v, configuration[j].i, configuration[j].j);
                    }
                    wentThrough = false;
                    badStarts.push(start);
                    break;
                }
            }
        }

        if (wentThrough == true && this.isMatrixAcceptable(m)) {
            this.m = m;
            this.foundSolution = true;
            return m;
        }
        //console.log(this.matrixToString(m, 9, 9));
        //console.log("SAVEDM02\n" + this.matrixToString(savedM, 9, 9));
        m = null;
        this.m = null;
        this.m = this.copyMatrix(savedM);
        //console.log(this.matrixToString(this.m, 9, 9));
        l = this.getCandidateList(this.m);
        //console.log(this.candidateListToString(l));
    }
    return true;
}

SudokuMatrix.prototype.getColumn = function(m, j) {
    var l = [];
    for (var i = 0; i < this.h; i++) {
        l.push(m[i][j]);
    }
    return l;
}

SudokuMatrix.prototype.getRow = function(m, i) {
    var l = [];
    for (var j = 0; j < this.w; j++) {
        l.push(m[i][j]);
    }
    return l;
}

SudokuMatrix.prototype.getQuadrant = function(m, q) {
    var qIntDiv = Math.floor(q / 3);
    var qRemainder = q - (qIntDiv * 3);
    var mini = qIntDiv * 3;
    var minj = qRemainder * 3;
    var l = [];
    for (var i = mini; i < mini + 3; i++) {
        for (var j = minj; j < minj + 3; j++) {
            l.push(m[i][j]);
        }
    }
    return l;
}

SudokuMatrix.prototype.isMatrixAcceptable = function(m) {
//    console.log("isMatrixAcceptable\n" + this.matrixToString(m, this.h, this.w));
    for (var i = 0; i < this.h; i++) {
        var row = this.listToBigNumber(this.getRow(m, i));
        var col = this.listToBigNumber(this.getColumn(m, i));
        var qua = this.listToBigNumber(this.getQuadrant(m, i));
        if (row != this.acceptable ||
            col != this.acceptable ||
            qua != this.acceptable) {
            //console.log("i=" + i + " row=" + row.toString(16) + " col=" + col.toString(16) + " qua=" + qua.toString(16) + " acceptable=" + this.acceptable.toString(16) + ", therefore, refused");
            return false;
        }
    }
    this.foundSolution = true;
    console.log("isMatrixAcceptable: YES!\n");
    return true;
}

SudokuMatrix.prototype.isSolutionAcceptable = function() {
    for (var i = 0; i < this.h; i++) {
        for (var j = 0; j < this.w; j++) {
            if (this.solution[i][j] < 1) {
                return false;
            }
            if (!this.isValueAcceptableInSolution(this.m[i][j], i, j)) {
                return false;
            }
        }
    }
    this.m = this.solution;
    return true;
}

SudokuMatrix.prototype.solutionToString = function() {
    var s = "  0123456789\n";
    for (var i = 0; i < this.h; i++) {
        s += i + " ";
        for (var j = 0; j < this.w; j++) {
            s += this.solution[i][j];
        }
        s += " " + i + "\n";
    }
    s += "  0123456789";
    return s;
}

SudokuMatrix.prototype.populateLineFromString = function(i, str) {
    //console.log("populateLineFromString " + i + " " + str);
    for (var j = 0; j < str.length; j++) {
        var c = str[j];
        var l = [];
        if (c >= "0" && c <= "9") {
            this.m[i][j] = Number(c);
        }
    }
}


function rnd(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function getNextCell(prefix, i, j) {
    if (j < 8)
    {
        j++;
    }
    else
    {
        j = 0;
        i = integerRemainder(i + 1, 9);
    }
    var id = prefix + i + j;
    var x = document.getElementById(id);
    if (x.disabled)
    {
        x = getNextCell(prefix, i, j);
    }
    return x;
}

function getCell(prefix, i, j) {
    var id = prefix + i.toString() + j.toString();
    var x = document.getElementById(id);
    return x;
}


function sudokuStyle() {

/*    document.getElementById("sudokuTable").style.visibility = "hidden"; */
    var sid = document.getElementById("sudokuImageDiv");
    sid.style.display = 'none';
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var inputCell = getCell("id", i, j);

            if (inputCell.value != "") {
              inputCell.style.backgroundColor = "lightgrey";
              inputCell.disabled = true;
            }
            else {
              inputCell.style.backgroundColor = "white";
              inputCell.disabled = false;

            }
        }
    }
}


function randomPopulate() {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var inputCell = getCell("id", i, j);
              if (rnd(0,2) == 0)
              {
                inputCell.value = rnd(1, 9);
            }
            else {
                inputCell.value = "";
            }
        }
    }
    sudokuStyle();
}

function butGo_Click() {
    sudokuStyle();
    var butSolve = document.getElementById("butSolve");
    butSolve.disabled = false;
}

function butSolve_Click(){

    var m = new SudokuMatrix;
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var inputCell = getCell("id", i, j);
            if (inputCell.value != "")
            {
                m.setAt(Number(inputCell.value), i, j);
            }
        }
    }
    if (m.FindSolution()) {
        butGo_Click();
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                var inputCell = getCell("id", i, j);
                if (inputCell.value == "")
                {
                    inputCell.value = m.getAt(i, j);
                }
            }
        }
    } else {
        alert("Could not solve sudoku, check initial values.");
        var offendingCell = getCell("id", m.offendingRow, m.offendingColumn);
        offendingCell.style.backgroundColor = "red";
    }

}

var captureIFrameZoom = 100;

function loadPageToCaptureIFrame() {
    var cap = document.getElementById("captureIFrame");
    cap.src = "";
    var url = document.getElementById("capturerURLText").value;
    url = url + "#zoom=" + captureIFrameZoom.toString();
    cap.src = url;
}

function butCaptureFromURL_Click(){
    var url = document.getElementById("capturerURLText").value;
    if (!url.startsWith("http://"))
        url = "http://" + url ;
    document.getElementById("capturerURLText").value = url;
    captureIFrameZoom = 100;
    loadPageToCaptureIFrame();

}

function getCaptureIFrameZoom(){
    var cap = document.getElementById("captureIFrame");
    var z = cap.style.zoom;
    if (z == "") {
        z = "100%";
    }
    z = z.replace("%","");
    var nz = Number(z);
    return nz;
}

function setCaptureIFrameZoom(nz){
    var cap = document.getElementById("captureIFrame");
    var z = nz.toString() + "%";
    cap.style.zoom = z;
}

function butCaptureZoomOut_Click(){
    captureIFrameZoom = captureIFrameZoom -10;
    loadPageToCaptureIFrame();
}

function butCaptureZoomIn_Click(){
    captureIFrameZoom = captureIFrameZoom + 10;
    loadPageToCaptureIFrame();
}


function butManuall_Click() {

}

function butFromFile() {

}


function getIdPrefix(id) {
    return id.substring(0, 2);
}

function getIdI(id) {
    return Number(id.substring(2, 3));
}

function getIdJ(id) {
    return Number(id.substring(3, 4));
}

function z9(n) {
    if (n < 0) return 0;
    if (n > 8) return 8;
    return n;
}


function onInput(element) {
    if (element.value.length > 0)
    {
        var prefix = getIdPrefix(element.id);
        var i = getIdI(element.id);
        var j = getIdJ(element.id);
        element.style.backgroundColor = "white";
        var nextElement = getNextCell(prefix, i, j);
        nextElement.focus();
    }
}


function onBlur(element) {

}
