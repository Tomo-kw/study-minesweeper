// 盤面の縦横のマス数（個）
let boardWidth;

// 爆弾の密度（%）
let bombDensity;

// 爆弾の個数
let bombCount;

// 左クリックされた要素を格納する配列
let cells;

// 旗を立てた要素を格納する配列
let flagCells;

// 盤面の配列
let boards;

// 爆弾ではないマスの数（ゲームクリアに使用する）
let safeCellsCount;

// 表示用の爆弾残数
let bombCounter;

// ゲームオーバーのフラグ
let isGameOver = false;

const Bom = '爆'

// ゲームスタート
function gameStartClick() {
    resetAllValues();

    // 盤面の縦横のマス数（個）
    boardWidth = document.querySelector('.boardWidthNum').value;

    // 爆弾の密度（%）
    bombDensity = document.querySelector('.bombDensity').value;
    
    // 爆弾の個数
    bombCount = Math.floor(boardWidth ** 2 * bombDensity / 100);

    // 盤面の縦横が少なすぎると0になるための対応
    if (bombCount < 1) {
        bombCount = 1;
    }

    // 爆弾ではないマスの数（ゲームクリアに使用する）
    safeCellsCount = boardWidth ** 2 - bombCount;

    // 表示用の爆弾残数
    bombCounter = bombCount;

    // スタートの盤面配列を作成する
    createInitialBoard()

    // 初期盤面を作成する→その時に爆弾をセットせず、クリックでできたらいいけど
    createInitialBoardHTML()
}

// 各値のリセット
function resetAllValues() {
    document.getElementById('table').innerHTML = '';

    boardWidth = '';
    bombDensity = '';
    bombCount = '';
    cells = [];
    flagCells = [];
    boards = [];
    safeCellsCount = '';
    bombCounter = '';
    isGameOver = false;
}

// 初期盤面の配列作成
function createInitialBoard() {
    // 空盤面作成
    for(let i = 0; i < boardWidth; i++) {
        let rows = [];
        for (let j = 0; j < boardWidth; j++) {
            rows.push('');
        }
        boards.push(rows);
    }

    // 爆弾の場所設定
    let i = 0;
    while(i < bombCount) {
        let y = Number(Math.floor(Math.random() * boardWidth))
        let x = Number(Math.floor(Math.random() * boardWidth))
        if (boards[y][x] === Bom) {
            continue;
        }
        boards[y][x] = Bom;
        i++;
    }
}

// 初期盤面のHTML作成
function createInitialBoardHTML() {
    let table = document.getElementById('table');

    for (let y = 0; y < boardWidth; y++) {
        let tr = document.createElement('tr');
        table.appendChild(tr);

        for (let x = 0; x < boardWidth; x++) {
            let td = document.createElement('td');
            td.classList.add('hide');
            td.textContent = boards[y][x];
            td.setAttribute('x',x);
            td.setAttribute('y',y);
            td.onclick = leftClick;
            td.oncontextmenu = rightClick;
            tr.appendChild(td);
        }
        //  爆弾の数を表示
        document.querySelector('.bombCount').innerHTML = bombCount;
    }
}

// クリックしたマスの周りにある爆弾の数を返す
function bomCount(clickX, clickY) {
    const x = Number(clickX);
    const y = Number(clickY);

    let bomCount = 0;

    // 左上
    if (y > 0 && x > 0 && boards[y-1][x-1] === Bom) {
        bomCount++;
    }

    // 上
    if (y > 0 && boards[y-1][x] === Bom) {
        bomCount++;
    }

    // 右上:maxの値+1
    if (y > 0 && x < boardWidth - 1 && boards[y-1][x+1] === Bom) {
        bomCount++;
    }

    // 右
    if (x < boardWidth-1 && boards[y][x+1] === Bom) {
        bomCount++;
    }

    // 右下
    if (y < boardWidth-1 && x < boardWidth - 1 && boards[y+1][x+1] === Bom) {
        bomCount++;
    }

    // 下
    if (y < boardWidth - 1 && boards[y+1][x] === Bom) {
        bomCount++;
    }

    // 左下
    if (y < boardWidth - 1 && x > 0 && boards[y+1][x-1] === Bom) {
        bomCount++;
    }

    // 左
    if (x > 0 && boards[y][x-1] === Bom) {
        bomCount++;
    }

    return bomCount === 0 ? '' :  bomCount;
}

function leftClick() {

    // TODO:初回クリック時に盤面を生成したい

    // クリックしたセルの位置をセット
    let clickX = this.getAttribute('x');
    let clickY = this.getAttribute('y');

    // 旗が立っている場合は何もしない
    let changeFlag = false;

    for(let i = 0; i < flagCells.length; i++) {
        if (Number(flagCells[i].x) === Number(clickX) && Number(flagCells[i].y) === Number(clickY)) {
            changeFlag = true;
        }
    }

    if (changeFlag) {
        return;
    }

    // 既にクリックされているかのチェック
    let isChecked =  isCellChecked(clickX, clickY);

    if (isChecked) {
        return;
    }

    // ゲームオーバー マスを全解放
    if (boards[clickY][clickX] === Bom) {
        isGameOver = true;
        tableGeneration();

        document.querySelector('h3').innerHTML = 'ゲームオーバー！';
        return;
    }

    // クリックされた要素を格納
    cells.push({x : clickX, y : clickY});

    // ゲームオーバーでなければクリックしたマスの周囲の爆弾の個数をセット
    boards[clickY][clickX] = bomCount(clickX, clickY);
    // 空の場合に周りを開く
    safeCellsCount--;

    // クリックしたセルが空の場合周りのマスも開く
    if (boards[clickY][clickX] === '') {
        // チェックしたマスと開いたマスの数を引く
        safeCellsCount -= openCellsCount(clickX, clickY);
    }

    // 盤面を更新する
    tableGeneration();

    if (safeCellsCount === 0) {
        document.querySelector('h3').innerHTML = 'クリア！おめでとう！';
    }
}

function rightClick(e) {
    // 右クリックのメニュー表示を無効化
    e.preventDefault();

    let clickX = this.getAttribute('x');
    let clickY = this.getAttribute('y');
    
    // 既に左クリックで開かれている場合は何もしない
    let isChecked =  isCellChecked(clickX, clickY);

    if (isChecked) {
        return;
    }

    // 旗が立っていたら旗を下ろす
    let changeFlag = false;

    for(let i = 0; i < flagCells.length; i++) {
        if (Number(flagCells[i].x) === Number(clickX) && Number(flagCells[i].y) === Number(clickY)) {
            flagCells.splice(i, 1)
            changeFlag = true
            bombCounter++
            document.querySelector('.bombCount').innerHTML = bombCounter
        }
    }

    // 旗を立てる
    if (!changeFlag) {
        if (bombCounter === 0) {
            return
        }
        flagCells.push({x : clickX, y : clickY});

        bombCounter--;
        document.querySelector('.bombCount').innerHTML = bombCounter;
    }

    // 盤面を更新する
    tableGeneration();
}

// 爆弾を選んだ時は全てオープンhideをつけない重複チェックもしない
function tableGeneration() {
    let table = document.getElementById('table');
    table.innerHTML = '';

    for (let y = 0; y < boardWidth; y++) {
        let tr = document.createElement('tr');
        table.appendChild(tr);

        for (let x = 0; x < boardWidth; x++) {
            let td = document.createElement('td');
            td.innerHTML = boards[y][x];
            // TODO:とりあえずクラス付与して消してるけどやり方考えよ

            if (!isGameOver) {
                td.classList.add('hide');
                // hideをつけなければカラーはつかない
                for (let z = 0; z < cells.length; z++) {
                    if (y === Number(cells[z].y) && x === Number(cells[z].x)) {
                        td.classList.remove('hide');
                        break;
                    }
                }
                // 旗の表示
                for (let n = 0; n < flagCells.length; n++) {
                    if (y === Number(flagCells[n].y) && x === Number(flagCells[n].x)) {
                        td.classList.add('flag')
                        break
                    }
                }

                td.setAttribute('x', x);
                td.setAttribute('y', y);
                td.onclick = leftClick;
                td.oncontextmenu = rightClick;
            }
            tr.appendChild(td);
        }
    }
}

// クリックされた空マスの周りのマスを開き数をカウントする
function openCellsCount(clickX, clickY) {
    // クリックされたマス情報
    const x = Number(clickX);
    const y = Number(clickY);

    let openCellsCount = 0;
    let checkX;
    let checkY;

    // 左上のマス
    if (y > 0 && x > 0) {
        checkX = x - 1;
        checkY = y - 1;

        let isDuplicate =  duplicateCheck(checkX, checkY)

        if (!isDuplicate) {
            // TODO:開いたマスが空の場合は更に周りもチェックしたい

            cellUpdate(checkX, checkY)
            openCellsCount++;

            if (boards[checkY, checkX] === '') {
                openCellsCount()
            }
        }
    }

    // 上のマス
    if (y > 0) {
        checkX = x;
        checkY = y - 1;

        let isDuplicate =  duplicateCheck(checkX, checkY)

        if (!isDuplicate) {
            cellUpdate(checkX, checkY)
            openCellsCount++;
        }
    }

    // 右上のマス
    if (y > 0 && x < boardWidth - 1) {
        checkX = x + 1;
        checkY = y - 1;

        let isDuplicate =  duplicateCheck(checkX, checkY)

        if (!isDuplicate) {
            cellUpdate(checkX, checkY)
            openCellsCount++;
        }  
    }

    // 右のマス
    if (x < boardWidth - 1) {
        checkX = x + 1;
        checkY = y;

        let isDuplicate =  duplicateCheck(checkX, checkY)

        if (!isDuplicate) {
            cellUpdate(checkX, checkY)
            openCellsCount++;
        }
    }

    // 右下のマス
    if (y < boardWidth - 1 && x < boardWidth - 1) {
        checkX = x + 1;
        checkY = y + 1;

        let isDuplicate =  duplicateCheck(checkX, checkY)

        if (!isDuplicate) {
            cellUpdate(checkX, checkY)
            openCellsCount++;
        }
    }

    // 下のマス
    if (y < boardWidth - 1) {
        checkX = x;
        checkY = y + 1;

        let isDuplicate =  duplicateCheck(checkX, checkY)

        if (!isDuplicate) {
            cellUpdate(checkX, checkY)
            openCellsCount++;
        }
    }

    // 左下のマス
    if (y < boardWidth - 1 && x > 0) {
        checkX = x - 1;
        checkY = y + 1;

        let isDuplicate =  duplicateCheck(checkX, checkY)

        if (!isDuplicate) {
            cellUpdate(checkX, checkY)
            openCellsCount++;
        }
    }

    // 左のマス
    if (x > 0) {
        checkX = x - 1;
        checkY = y;

        let isDuplicate =  duplicateCheck(checkX, checkY)

        if (!isDuplicate) {
            cellUpdate(checkX, checkY)
            openCellsCount++;
        }
    }

    return openCellsCount;
}


// クリックしたセルの周りのセルが左クリック・旗が置かれていないかをチェックする
function duplicateCheck(x, y) {
    let isDuplicate = false;
    
    // 左クリックされていないか
    for(let i = 0; i < cells.length; i++) {
        if (Number(cells[i].x) === Number(x) && Number(cells[i].y) === Number(y)) {
            isDuplicate = true
            continue;
        }
    }
    // 旗が立っていないか
    for(let i = 0; i < flagCells.length; i++) {
        if (Number(flagCells[i].x) === Number(x) && Number(flagCells[i].y) === Number(y)) {
            isDuplicate = true;
            continue;
        }
    }
    return isDuplicate;
}

// セルの値を更新する
function cellUpdate (checkX, checkY) {
    boards[checkY][checkX] = bomCount(checkX, checkY);
    cells.push({x : checkX, y : checkY});
}

// セルが左クリックで開かれているかのチェック
function isCellChecked(clickX, clickY) {
    let isChecked = false;

    for(let i = 0; i < cells.length; i++) {
        if (Number(cells[i].x) === Number(clickX) && Number(cells[i].y) === Number(clickY)) {
            isChecked = true;
            break;
        }
    }
    
    return isChecked;
}

