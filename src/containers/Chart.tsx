import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button';
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries, LineSeries, BarSeries } from "react-stockcharts/lib/series";
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
import { ChartTooltip, EdgeIndicatorComponent, Loading } from './ChartComponents';

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
      start_date: '2021-03-27',
      end_date: now(),
      order: 'ASC',
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
        }, {
          name: 'macd',
          symbol: [pair],
          order: "ASC",
          interval: [time],
          fast_period: 20,
          slow_period: 40
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
        setData(resJson)
      })
    // }, 30000)

    return () => {
      if (interval)
        clearInterval(interval)
    }
  }, [])

  if (data.length === 0)
    return <Loading />

  const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => new Date(d.date));
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
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#141822', height: '100%' }}>
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
          height={height - indicatorHeight * 2 - 120}
        >
          <YAxis axisAt="right" orient="right" ticks={12} stroke="#fdbf00" tickStroke="#fdbf00" />

          <EdgeIndicatorComponent />

          <MouseCoordinateY
            at="right"
            edgeAt="right"
            orient="left"
            dx={50}
            displayFormat={format(".5f")} />

          <CandlestickSeries {...candlesAppearance} />

          <ChartTooltip atr={atr14} />

          <LineSeries
            yAccessor={(d) => d.ichi}
            stroke={'white'} />

        </Chart>

        <Chart id={2}
          yExtents={atr14.accessor()}
          height={indicatorHeight} origin={(w, h) => [0, h - indicatorHeight * 2 - indicatorHeight / 2]} padding={{ top: 10, bottom: 10 }}>
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
        <Chart id={3}
          yExtents={(d) => ([d.trendDown > d.trendUp ? d.trendDown : d.trendUp, 0])}
          height={indicatorHeight + indicatorHeight / 2} origin={(w, h) => [0, h - indicatorHeight - indicatorHeight / 2]} padding={{ top: 10, bottom: 10 }}>
          <XAxis axisAt="bottom" orient="bottom" stroke="#fdbf00" tickStroke="#fdbf00" />
          <YAxis axisAt="right" orient="right" ticks={5} stroke="#fdbf00" tickStroke="#fdbf00" />

          <BarSeries
            yAccessor={d => d.trendDown}
            fill='rgba(239, 84, 81, 1)'
            stroke={false}
          />

          <BarSeries
            fill='rgba(53, 167, 154, 1)'
            border='rgba(53, 167, 154, 1)'
            yAccessor={d => d.trendUp}
            stroke={false}
          />

          <EdgeIndicator
            itemType="last"
            at="right"
            edgeAt="right"
            orient="left"
            dx={50}
            yAccessor={d => d.trendDown} displayFormat={format(".5f")} fill={fill} />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    </Box>
  );
}

export default ChartComponent