import React from "react"
import { Box } from "@material-ui/core"
import Lottie from "react-lottie"
import animationData from '../resources/loading.json'
import {
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
  EdgeIndicator,
  SingleValueTooltip
} from "react-stockcharts/lib/coordinates";
import { OHLCTooltip, MovingAverageTooltip } from "react-stockcharts/lib/tooltip";
import { atr } from 'react-stockcharts/lib/indicator'
import { last } from "react-stockcharts/lib/utils";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { theme } from '../styles/theme';

const fill = (d) =>
  d.close > d.open ? theme.palette.green : theme.palette.red;

export const Loading = () => {
  return (
    <Box sx={{
      backgroundColor: '#141822',
      display: 'flex',
      height: '100%',
      alignItems: 'center'
    }}>
      <Lottie options={{
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
      }}
        isPaused={false}
        isStopped={false}
        height={60}
        width={60} />
    </Box>
  )
}

export const EdgeIndicatorComponent = () => {
  return (
    <EdgeIndicator
      itemType="last"
      at="right"
      edgeAt="right"
      orient="left"
      dx={50}
      yAccessor={d => d.close}
      displayFormat={format(".5f")} fill={fill} />
  )
}

export const ChartTooltip = ({ atr: atr14}) => {
  return (
    <>
      <OHLCTooltip
        forChart={1}
        origin={[0, 0]}
        ohlcFormat={format(".5f")}
        fontSize={16}
        displayTexts={{ o: 'O', c: 'C', l: 'L', h: 'H' }}
        textFill='white'
        labelFill='#fdbf00'
      />

      <MovingAverageTooltip
        onClick={e => console.log(e)}
        origin={[0, 15]}
        displayFormat={format('.5f')}
        valueFill='white'
        fontSize={12}
        textFill='white'
        color='white'
        labelFill='#fdbf00'
        options={[
          {
            yAccessor: (d) => d.ichi,
            type: 'ICHI',
            stroke: '#fdbf00',
            windowSize: '26',
          },
        ]}
      />

      <MovingAverageTooltip
        onClick={e => console.log(e)}
        origin={[60, 15]}
        displayFormat={format('.5f')}
        fontSize={12}
        textFill={atr14.stroke()}
        labelFill='#fdbf00'
        options={[
          {
            yAccessor: atr14.accessor(),
            type: "ATR",
            stroke: '#fdbf00',
            windowSize: atr14.options().windowSize,
          },
        ]}
      />
      
      <MovingAverageTooltip
        onClick={e => console.log(e)}
        origin={[120, 15]}
        displayFormat={format('.5f')}
        fontSize={12}
        textFill={atr14.stroke()}
        labelFill='#fdbf00'
        options={[
          {
            yAccessor: d => d.trendDown,
            type: "DOWN",
            stroke: '#fdbf00',
            windowSize: atr14.options().windowSize,
          },
        ]}
      />
    </>
  )
}