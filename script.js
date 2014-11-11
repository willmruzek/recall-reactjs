(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Recall = factory();
  }
}(this, function () {

  var Grid = React.createClass({
    handleClick: function (rowIdx, colIdx) {
      this.props.onTileClick(rowIdx, colIdx);
    },

    render: function () {
      return (
        <div className="recall-grid">
          {this.props.matrix.map(function (row, rowIdx) {
            return (
              <div key={rowIdx} className="recall-grid-row">
                {row.map(function (col, colIdx) {
                  return (
                    <div key={colIdx} className={'recall-grid-tile ' + (col ? 'is-selected' : '')} onClick={this.handleClick.bind(this, rowIdx, colIdx)}></div>
                  );
                }.bind(this))}
              </div>
            ); 
          }.bind(this))}
        </div>
      );
    }
  });

  var Recall = React.createClass({

    start: function () {
      this.numSelectedTiles = 0;
      this.isDisabled = true;
      this.expectedMatrix = this._generateExpectedMatrix();
      
      this.setState({
        matrix: this.expectedMatrix
      });

      setTimeout(function () {
        this.setState({ matrix: generateSquareMatrix(this.props.size, false) });
        this.isDisabled = false;
      }.bind(this), 5000);
    },
    
    restart: function () {
      this.setState({ userWon: null });
      this.start();
    },
    
    selectTile: function (rowIdx, colIdx) {
      if(this.isDisabled) return;
      
      var clone = this.state.matrix.slice(0);
      clone[rowIdx][colIdx] = true;
      
      this.numSelectedTiles = this.numSelectedTiles + 1;
      if(this.numSelectedTiles === this.props.numToChoose) this.checkAnswer();
      
      this.setState({
        matrix: clone
      });
    },

    checkAnswer: function () {
      if(this._isCorrectSelection()) {
        this.setState({ userWon: true });
      } else {
        this.setState({ userWon: false });
      }

      this.isDisabled = true;
    },

    _isCorrectSelection: function () {
      var row, col, num = this.props.size;
      for(row = 0; row < num; row++) {
        for(col = 0; col < num; col++) {
          if(this.expectedMatrix[row][col] !== this.state.matrix[row][col]) return false;
        }
      }

      return true;  
    },
    
    _generateExpectedMatrix: function () {
      var matrix = generateSquareMatrix(this.props.size, false),
          numSelected = 0,
          randRow = 0, randCol = 0;

      while(numSelected < this.props.numToChoose) {
        randRow = randomWithinRange(0, matrix.length);
        randCol = randomWithinRange(0, matrix[0].length);

        if(!matrix[randRow][randCol]) {
          matrix[randRow][randCol] = true;
          numSelected += 1;
        }
      }

      return matrix;
    },

    componentDidMount: function () {
      this.start();
    },
    
    getDefaultProps: function () {
      return {
        numToChoose: 9,
        size: 5
      };
    },
    
    getInitialState: function() {
      return {
        userWon: null,
        matrix: generateSquareMatrix(this.props.size, false)
      };
    },
      
    render: function () { 
      return (
        <div className="recall">
          <div className={'recall-message recall-win-message ' + (!this.state.userWon ? 'is-hidden' : '')}>
            You win!
            <button className="recall-restart-btn" onClick={this.restart}>Do it again!</button> 
          </div>
          <div className={'recall-message recall-win-message ' + ((this.state.userWon === null || this.state.userWon) ? 'is-hidden' : '')}>
            Whomp... Sorry
            <button className="recall-restart-btn" onClick={this.restart}>Try again...</button> 
          </div>        
          <Grid matrix={this.state.matrix} onTileClick={this.selectTile} />
        </div>
      );
    }
  });
    
  function generateSquareMatrix(num, value) {
    var arr = [], row, col;
    for(row = 0; row < num; row++) {
      arr[row] = [];
      for(col = 0; col < num; col++) {
        arr[row][col] = value;
      }
    }

    return arr;
  }

  function randomWithinRange(min, range) {
    return min + Math.floor(Math.random() * range);
  }

  return Recall;
}));
