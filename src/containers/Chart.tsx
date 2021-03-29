import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button';
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries } from "react-stockcharts/lib/series";
import { OHLCTooltip } from "react-stockcharts/lib/tooltip";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY
} from "react-stockcharts/lib/coordinates";
import { last } from "react-stockcharts/lib/utils";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import useWindowDimensions from '../utils/dimension';

const ChartComponent = () => {
  const { width, height } = useWindowDimensions()
  const [data, setData] = useState([])
  useEffect(() => {

    const body = {
      symbols: ["GBP/USD"],
      intervals: ["30min"],
      start_date: '2021-02-28',
      end_date: '2021-03-30',
      order: 'ASC',
      timezone: 'Europe/Rome',
      methods: [
        'time_series'
      ]
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };

    fetch('http://localhost:6423/complex', requestOptions)
      .then(res => res.json())
      .then(resJson => {
        if (resJson.data[0]) {

          const resData = resJson.data[0].values.map((row) => ({
            date: new Date(row.datetime),
            high: parseFloat(row.high),
            low: parseFloat(row.low),
            open: parseFloat(row.open),
            close: parseFloat(row.close),
          }))

          setData(resData)
        } else console.log(resJson)
      })
  }, [])

  if (data.length === 0)
    return <div>loading</div>

  const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);
  const { data: scaleData, xScale, xAccessor, displayXAccessor } = xScaleProvider(data);
  const start = xAccessor(last(scaleData));
  const end = xAccessor(scaleData[Math.max(0, data.length - 50)]);
  const xExtents = [start, end];

  console.log(scaleData)

  const fill = (d) =>
    d.close > d.open ? "rgba(53, 167, 154, 1)" : "rgba(239, 84, 81, 1)";

  const candlesAppearance = {
    wickStroke: fill,
    fill: fill,
    stroke: fill,
    candleStrokeWidth: 1,
    widthRatio: 0.8,
    opacity: 1,
  }

  return (
    <div style={{  }}>
      <ChartCanvas height={height- 100}
        ratio={1}
        width={width}
        type={'SVG'}
        margin={{ left: 50, right: 60, top: 10, bottom: 40 }}
        seriesName="EURUSD"
        data={scaleData}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
      >

        <Chart id={1} yExtents={d => ([d.high, d.low])}>
          <XAxis axisAt="bottom" orient="bottom" ticks={12} />
          <YAxis axisAt="right" orient="left" ticks={12} />

          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat("%m-%d-%I:%M %p")} />
          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".5f")}
          />

          <OHLCTooltip forChart={1} origin={[0, 0]} />
          <CandlestickSeries {...candlesAppearance} />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    </div>
  );
}

export default ChartComponent