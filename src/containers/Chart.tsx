import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button';
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries, LineSeries } from "react-stockcharts/lib/series";
import { OHLCTooltip, MovingAverageTooltip } from "react-stockcharts/lib/tooltip";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import Lottie from 'react-lottie';
import animationData from '../resources/loading.json'
import {
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
  EdgeIndicator,
  SingleValueTooltip
} from "react-stockcharts/lib/coordinates";
import { atr } from 'react-stockcharts/lib/indicator'
import { last } from "react-stockcharts/lib/utils";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import useWindowDimensions from '../utils/dimension';
import { Box, Typography } from '@material-ui/core';
import { theme } from '../styles/theme';
import { objectToQuery, queryToObject } from '../utils/query-parser';
import { ChartQuery, Timeseries } from '../types/Chart';
import { now } from '../utils/date-format'

interface Params {
  location: {
    search: string
  }
}
const ChartComponent = ({ location: { search } }: Params) => {
  const { width, height } = useWindowDimensions()
  const [data, setData] = useState([])
  const [live, setLive] = useState(false)
  let interval: null | NodeJS.Timeout = null
  const { pair, time } = queryToObject<ChartQuery>(search)

  useEffect(() => {

    const body = {
      symbols: [pair],
      intervals: [time],
      start_date: '2021-03-28',
      end_date: now(),
      order: 'ASC',
      outputsize: 100,
      timezone: 'Europe/Rome',
      methods: [
        'time_series', {
          name: "atr",
          symbol: [pair],
          order: "ASC",
          interval: [time]
        }, {
          name: 'ichimoku',
          symbol: [pair],
          interval: [time],

          start_date: '2021-03-28',
          end_date: now(),
        }
      ]
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };

    // interval = setInterval(() => {
    console.log(now())
    fetch('http://localhost:6423/complex', requestOptions)
      .then(res => res.json())
      .then(resJson => {
        console.log(resJson)
        if (resJson.data && resJson.data[0].values) {
          const atrData = resJson.data[1].values
          const ichiData = resJson.data[2].values
          const resData = resJson.data[0].values.map((row, index) => ({
            date: new Date(row.datetime),
            high: parseFloat(row.high),
            low: parseFloat(row.low),
            open: parseFloat(row.open),
            close: parseFloat(row.close),
            atr: parseFloat(atrData[index].atr),
            ichi: parseFloat(ichiData[index].senkou_span_a)
          }))

          setData(resData)
        } else console.log(resJson)
      })
    // }, 30000)

    return () => {
      if (interval)
        clearInterval(interval)
    }
  }, [])

  if (data.length === 0)
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

  const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);
  const { data: scaleData, xScale, xAccessor, displayXAccessor } = xScaleProvider(data);
  const start = xAccessor(last(scaleData));
  const end = xAccessor(scaleData[Math.max(0, data.length - 50)]);
  const xExtents = [start, end];
  const atr14 = atr()
    .id(2)
    .options({ windowSize: 14 })
    .accessor(d => d.atr);

  console.log(scaleData)

  const fill = (d) =>
    d.close > d.open ? theme.palette.green : theme.palette.red;

  const candlesAppearance = {
    wickStroke: fill,
    fill: fill,
    stroke: fill,
    candleStrokeWidth: 1,
    widthRatio: 0.8,
    opacity: 1,
  }

  const indicatorHeight = 150

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#141822' }}>
      <ChartCanvas height={height - 70}
        ratio={1}
        width={width - 256}
        type={'svg'}
        margin={{ left: 10, right: 55, top: 20, bottom: 40 }}
        seriesName="EURUSD"
        data={scaleData}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents} >

        <Chart id={1}
          yExtents={d => ([d.high, d.low])}
          origin={(w, h) => [0, 0]}
          height={height - indicatorHeight - 120}
        >
          <YAxis axisAt="right" orient="right" ticks={12} stroke="#fdbf00" tickStroke="#fdbf00" />

          <EdgeIndicator
            itemType="last"
            at="right"
            edgeAt="right"
            orient="left"
            dx={50}
            yAccessor={d => d.close}
            displayFormat={format(".5f")} fill={fill} />

          <MouseCoordinateY
            at="right"
            edgeAt="right"
            orient="left"
            dx={50}
            displayFormat={format(".5f")} />

          <OHLCTooltip
            forChart={1}
            origin={[0, 0]}
            ohlcFormat={format(".5f")}
            fontSize={16}
            displayTexts={{ o: 'O', c: 'C', l: 'L', h: 'H' }}
            textFill='white'
            labelFill='#fdbf00'
          />
          <CandlestickSeries {...candlesAppearance} />

          <LineSeries
            yAccessor={(d) => d.ichi}
            stroke={'white'} />

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

        </Chart>

        <Chart id={2}
          yExtents={atr14.accessor()}
          height={indicatorHeight} origin={(w, h) => [0, h - indicatorHeight]} padding={{ top: 10, bottom: 10 }}>
          <XAxis axisAt="bottom" orient="bottom" stroke="#fdbf00" tickStroke="#fdbf00" />
          <YAxis axisAt="right" orient="right" ticks={2} stroke="#fdbf00" tickStroke="#fdbf00" />

          <LineSeries
            yAccessor={atr14.accessor()}
            stroke={atr14.stroke()} />

          <EdgeIndicator
            itemType="last"
            at="right"
            edgeAt="right"
            orient="left"
            dx={50}
            yAccessor={d => d.atr} displayFormat={format(".5f")} fill={fill} />

          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            fitToText={true}
            rectWidth={110}
            fill='#4C525E'
            displayFormat={timeFormat("%m-%d-%I:%M %p")} />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    </Box>
  );
}

export default ChartComponent