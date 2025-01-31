// COMOPONENT OR LIBRARY IMPORT
import React, { PureComponent } from "react";
import { Svg, Text, Path, Line } from "react-native-svg";
import { View, Dimensions } from "react-native";
import PropTypes from "prop-types";

const { height, width } = Dimensions.get("window");

const responsiveHeight = h => {
  return height * (h / 100);
};

export class DashedProgress extends PureComponent {
  constructor(props) {
    super(props);
    //calculate first position of stopIndicator
    const { radius, barWidth, strokeThickness, indicatorWidth } = props;
    const center =
      radius + Math.max(barWidth, indicatorWidth) + strokeThickness;
    //set animated state value
    this.state = {
      last_stroke_index: 0,
      last_trail_index: 0,
      bigCircle: [],
      number: [],
      stopIndicator: {
        fromX: center,
        fromY: center - (radius - barWidth),
        toX: center,
        toY: center - (radius + indicatorWidth)
      }
    };

    this.increment_timer = () => {};
    this.decrement_timer = () => {};
  }

  componentDidUpdate(prevProps) {
    try {
      //call when fill value change
      if (this.props.fill != prevProps.fill) {
        //if current fill is greater than previous fill then call function for display increasing animated dash
        if (this.props.fill > prevProps.fill) {
          this.increaseWeight();
        } else {
          //if current fill is less than previous fill then call function for display decreasing animated dash
          this.decreaseWeight();
        }
      }
    } catch (error) {
      console.log("catch error at in getDerivedStateFromProps  >>>>> ", error);
    }
  }

  componentDidMount() {
    try {
      this.getPathDirections().then(response => {
        if (response) {
          this.increaseWeight();
        }
      });
    } catch (error) {
      console.log("catch error at componentDidMount  >>>>> ", error);
    }
  }

  //prepare array to draw dashed
  getPathDirections() {
    const {
      radius,
      barWidth,
      strokeThickness,
      dividerNumber,
      indicatorWidth,
      countBars,
      divideEnabled,
      trailColor
    } = this.props;

    return new Promise((resolve, reject) => {
      try {
        var count = 0;
        var dashed = [];
        var j;
        var textX;
        var textY;
        number = [];
        var i;
        var addDividedNumber = false;
        var text = 0;
        var ten_counter = 0;

        //calculate center position in svg view
        const center =
          radius + Math.max(barWidth, indicatorWidth) + strokeThickness;

        //set 3rd condition of for loop
        const decrement_i = 360 / ((countBars + 0.001) * 2);

        for (i = 180; i >= 0; i -= decrement_i) {
          //rotate by 180
          if (i < 90) {
            j = i - 90;
          } else {
            j = i + 90;
          }

          const angle = (j * Math.PI) / 90;

          //calculate starting position to end position of dash according to given barwidth
          var fromX = center + Math.sin(angle) * radius;
          var fromY = center + Math.cos(angle) * radius;

          var toX = center + Math.sin(angle) * (radius + barWidth);
          var toY = center + Math.cos(angle) * (radius + barWidth);

          //divide dash group in given dividerNumber
          if (divideEnabled) {
            if (ten_counter == (dividerNumber || 10)) {
              text = text + 1;
              addDividedNumber = true;
              var extrawidth = barWidth + responsiveHeight(0.2);

              //calculate position of number
              textX =
                center + Math.sin(angle) * (radius - barWidth - extrawidth);
              textY =
                center + Math.cos(angle) * (radius - barWidth - extrawidth);

              //calculate starting position to end position of big divider dash
              fromX = center + Math.sin(angle) * (radius + barWidth);
              fromY = center + Math.cos(angle) * (radius + barWidth);

              toX = center + Math.sin(angle) * (radius - barWidth);
              toY = center + Math.cos(angle) * (radius - barWidth);

              ten_counter = 0;
            }

            if (ten_counter < dividerNumber || 10) {
              ten_counter = ten_counter + 1;
            }

            //prepare array for displaying divider number
            if (addDividedNumber) {
              number.push({
                textX: textX,
                textY: textY,
                text: text,
                stroke: trailColor
              });
              addDividedNumber = false;
            }
          }

          //calculate starting position to end position of stopIndicator according to given indicatorWidth
          const fromX_stopIndicator =
            center + Math.sin(angle) * (radius + indicatorWidth);
          const fromY_stopIndicator =
            center + Math.cos(angle) * (radius + indicatorWidth);

          const toX_stopIndicator =
            center + Math.sin(angle) * (radius - barWidth);
          const toY_stopIndicator =
            center + Math.cos(angle) * (radius - barWidth);

          var stop_indicator = {
            fromX: fromX_stopIndicator,
            fromY: fromY_stopIndicator,
            toX: toX_stopIndicator,
            toY: toY_stopIndicator
          };

          //prepare array for displaying dashed circle
          dashed.push({
            fromX: fromX,
            fromY: fromY,
            toX: toX,
            toY: toY,
            stroke: trailColor,
            stopIndicator: stop_indicator
          });

          count = count + 1;
        }

        this.setState(
          {
            reaload: true,
            bigCircle: dashed,
            number: number
          },
          () => {
            if (this.state.bigCircle.length <= 0) {
              resolve(false);
            }
          }
        );

        resolve(true);
      } catch (error) {
        console.log("catch error at getPathDirections >>>>> ", error);
      }
    });
  }

  // interpolate start and end colors and find a value betwwen based on percentage 
  interpolateColor(col1, col2, p) {
    const rgb1 = parseInt(col1, 16);
    const rgb2 = parseInt(col2, 16);
    const [r1, g1, b1] = this.colorToArray(rgb1);
    const [r2, g2, b2] = this.colorToArray(rgb2);
  
    const q = 1-p;
    const rr = Math.round(r1 * p + r2 * q);
    const rg = Math.round(g1 * p + g2 * q);
    const rb = Math.round(b1 * p + b2 * q);
    const number = Number((rr << 16) + (rg << 8) + rb).toString(16);
    return `#${number}`
  }
  
  // utility method
  colorToArray(rgb) {
    const r = rgb >> 16;
    const g = (rgb >> 8) % 256;
    const b = rgb % 256;
  
    return [r, g, b];
  }
  //increase animated dash on weight_plate circle
  increaseWeight() {
    try {
      const { strokeColor, startColor, endColor, fill, duration } = this.props;
      const withoutHashStartColor = startColor.substring(1, startColor.length);
      const withoutHashEndColor = endColor.substring(1, endColor.length);
      //divide time interval for each dash
      var interval_time = 3;

      if (fill > 0) {
        interval_time = duration / (fill - this.state.last_stroke_index);
      }
      var i = this.state.last_trail_index;
      var k = i;
      var diff = 1;
      if (interval_time < 100) {
        diff = parseInt(100 / interval_time);
      }
      //clear all remaining intervals
      clearInterval(this.increment_timer);
      clearInterval(this.decrement_timer);

      //intilize new increment interval
      this.increment_timer = setInterval(() => {
        try {
          if (i <= fill) {
            var bigCircle = this.state.bigCircle;
            var stopIndicator = this.state.stopIndicator;
            for (k = i; k <= i + diff; k++) {
              if (bigCircle.length > k) {
                if (bigCircle[k].stroke != strokeColor && k <= fill) {
                  stopIndicator = bigCircle[k].stopIndicator;
                  bigCircle[k].stroke = this.interpolateColor(withoutHashStartColor, withoutHashEndColor, k/this.props.countBars);
                } else {
                  break;
                }
              } else {
                break;
              }
            }

            this.setState({
              last_stroke_index: k - 1,
              last_trail_index: k,
              bigCircle: bigCircle,
              stopIndicator: stopIndicator
            });
            i = k;
          } else {
            clearInterval(this.increment_timer);
          }
        } catch (err) {
          console.log(err);
        }
      }, interval_time);
    } catch (error) {
      console.log("catch error at increaseWeight >>>>> ", error);
    }
  }

  //decrease animated dash on weight_plate circle
  decreaseWeight() {
    try {
      const { trailColor, countBars, fill, duration } = this.props;

      //divide time interval for each dash
      var interval_time = 3;
      if (fill >= 0) {
        interval_time = duration / (this.state.last_trail_index - fill);
      }
      var last_length = fill;

      //counter for storing last animated dash
      var i = this.state.last_stroke_index;
      if (i >= countBars + 1) {
        i = countBars;
      }
      var k = i;
      var diff = 1;
      if (interval_time < 100) {
        diff = Math.round(100 / interval_time);
      }

      //clear all remaining intervals
      clearInterval(this.decrement_timer);
      clearInterval(this.increment_timer);

      //intilize new decrement interval
      this.decrement_timer = setInterval(() => {
        try {
          if (i >= last_length && i > 0) {
            var bigCircle = this.state.bigCircle;
            var stopIndicator = this.state.stopIndicator;
            for (k = i; k > i - diff; k--) {
              if (
                bigCircle[k].stroke != trailColor &&
                k >= last_length &&
                k > 0
              ) {
                stopIndicator = bigCircle[k].stopIndicator;
                bigCircle[k].stroke = trailColor;
              } else {
                break;
              }
            }

            this.setState({
              last_trail_index: k + 1,
              last_stroke_index: k,
              bigCircle: bigCircle,
              stopIndicator: stopIndicator
            });

            i = k;
          } else {
            clearInterval(this.decrement_timer);
          }
        } catch (err) {
          console.log(err);
        }
      }, interval_time);
    } catch (error) {
      console.log("catch error at decreaseWeight >>>>> ", error);
    }
  }

  render() {
    const {
      containerStyle,
      fill,
      radius,
      barWidth,
      strokeThickness,
      strokeLinecap,
      showTooltip,
      tooltipSize,
      tooltipColor,
      tooltipFamily,
      divideEnabled,
      text,
      dividerNumberSize,
      showIndicator,
      strokeColor,
      indicatorWidth,
      indicatorColor
    } = this.props;

    //calculate size of svg view
    const center =
      radius + Math.max(barWidth, indicatorWidth) + strokeThickness;
    const size = center * 2;

    //adjust fontSize of middle text
    var textFontSize = tooltipSize || 12;
    if (tooltipSize != undefined) {
      if (tooltipSize >= center) {
        textFontSize = center;
      } else {
        textFontSize = tooltipSize;
      }
    }

    return (
      <View style={containerStyle}>
        <Svg
          width={`${size}`}
          height={`${size}`}
          style={{ backgroundColor: "transparent" }}
        >
          {/*display animated circle view*/}
          {this.state.bigCircle.map((item, index) => (
            <Line
              key={`line_${index}`}
              x1={item.fromX}
              y1={item.fromY}
              x2={item.toX}
              y2={item.toY}
              stroke={item.stroke}
              strokeWidth={strokeThickness}
              strokeLinecap={strokeLinecap}
            />
          ))}

          {/*drawing divided lines and number */}
          {divideEnabled &&
            this.state.number.map((item, index) => (
              <Text
                key={`number_${index}`}
                x={item.textX}
                y={item.textY + (dividerNumberSize || 9) / 3}
                fill={item.stroke}
                fontSize={dividerNumberSize || 9}
                textAnchor="middle"
              >
                {item.text}
              </Text>
            ))}

          {/* display stop indicator at fill */}
          {showIndicator && (
            <Line
              x1={this.state.stopIndicator.fromX}
              y1={this.state.stopIndicator.fromY}
              x2={this.state.stopIndicator.toX}
              y2={this.state.stopIndicator.toY}
              stroke={indicatorColor}
              strokeWidth={strokeThickness}
              strokeLinecap={strokeLinecap}
            />
          )}

          {/*middle text*/}
          {showTooltip && (
            <Text
              x={center}
              y={center + textFontSize / 3}
              textAnchor="middle"
              fontSize={textFontSize}
              fontFamily={tooltipFamily}
              fill={tooltipColor}
            >
              {text || fill + "%"}
            </Text>
          )}
        </Svg>
      </View>
    );
  }
}

function isPositiveNumber(response) {
  if (response.fill < 0) {
    console.error(new Error("fill must be greater than or equal to 0"));
  } else if (response.fill > response.countBars) {
    console.error(
      new Error(`fill must be less than or equal to ${response.countBars}`)
    );
  }
}

DashedProgress.propTypes = {
  radius: PropTypes.number,
  barWidth: PropTypes.number,
  indicatorWidth: PropTypes.number,
  countBars: PropTypes.number,
  strokeThickness: PropTypes.number,
  fill: isPositiveNumber,
  strokeLinecap: PropTypes.string,
  trailColor: PropTypes.string,
  strokeColor: PropTypes.string,
  tooltipColor: PropTypes.string,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tooltipSize: PropTypes.number,
  showTooltip: PropTypes.bool,
  dividerNumber: PropTypes.number,
  dividerNumberSize: PropTypes.number,
  showIndicator: PropTypes.bool,
  indicatorColor: PropTypes.string,
  divideEnabled: PropTypes.bool,
  duration: PropTypes.number,
  containerStyle: PropTypes.object,
  tooltipFamily: PropTypes.string
};

DashedProgress.defaultProps = {
  radius: 100,
  countBars: 100,
  barWidth: 10,
  indicatorWidth: 20,
  strokeThickness: 1,
  fill: 50,
  trailColor: "#000000",
  strokeColor: "#008000",
  indicatorColor: "#008000",
  tooltipColor: "#008000",
  duration: 1000,
  strokeLinecap: "round",
  showIndicator: true,
  showTooltip: true,
  divideEnabled: false
};
