import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button';
import { ChartCanvas, Chart } from "react-stockcharts";
import { CandlestickSeries, LineSeries } from "react-stockcharts/lib/series";
import { OHLCTooltip, MovingAverageTooltip } from "react-stockcharts/lib/tooltip";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
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
import { Box } from '@material-ui/core';
import { theme } from '../styles/theme';
import { objectToQuery, queryToObject } from '../utils/query-parser';
import { ChartQuery, Timeseries } from '../types/Chart';

interface Params {
  location: {
    search: string
  }
}
const ChartComponent = ({ location: { search } }: Params) => {
  const { width, height } = useWindowDimensions()
  const [data, setData] = useState([])
  const { pair, time } = queryToObject<ChartQuery>(search)

  useEffect(() => {

    const body = {
      symbols: [pair],
      intervals: [time],
      start_date: '2021-03-28',
      end_date: '2021-03-31',
      order: 'ASC',
      outputsize: 100,
      timezone: 'Europe/Rome',
      methods: [
        'time_series', {
          name: "atr",
          symbol: ["MMM"],
          order: "ASC"
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

    fetch('http://localhost:6423/complex', requestOptions)
      .then(res => res.json())
      .then(resJson => {
        console.log(resJson)
        if (resJson.data[0].values) {
          const atrData = resJson.data[1].values
          const resData = resJson.data[0].values.map((row, index) => ({
            date: new Date(row.datetime),
            high: parseFloat(row.high),
            low: parseFloat(row.low),
            open: parseFloat(row.open),
            close: parseFloat(row.close),
            atr: parseFloat(atrData[index].atr)
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
  const indicatorOrigin = 0
  const chartOrigin = height - indicatorHeight

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ChartCanvas height={height - 120}
        ratio={1}
        width={width - 256}
        type={'svg'}
        margin={{ left: 10, right: 100, top: 10, bottom: 20 }}
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
          <YAxis axisAt="right" orient="right" ticks={12} />

          <EdgeIndicator itemType="last" orient="right" edgeAt="right"
            yAccessor={d => d.close} displayFormat={format(".5f")} fill={fill} />

          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".5f")} />

          <OHLCTooltip forChart={1} origin={[0, 0]} />
          <CandlestickSeries {...candlesAppearance} />

          <MovingAverageTooltip
            onClick={e => console.log(e)}
            origin={[0, 15]}
            displayFormat={format('.5f')}
            options={[
              {
                yAccessor: atr14.accessor(),
                type: "ATR",
                stroke: atr14.stroke(),
                windowSize: atr14.options().windowSize,

              },
            ]}
          />
        </Chart>

        <Chart id={2}
          yExtents={atr14.accessor()}
          height={indicatorHeight} origin={(w, h) => [0, h - indicatorHeight]} padding={{ top: 10, bottom: 10 }}>
          <XAxis axisAt="bottom" orient="bottom" />
          <YAxis axisAt="right" orient="right" ticks={2} />

          <LineSeries
            yAccessor={atr14.accessor()}
            stroke={atr14.stroke()} />

          <EdgeIndicator itemType="last" orient="right" edgeAt="right"
            yAccessor={d => d.atr} displayFormat={format(".5f")} fill={fill} />


          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat("%m-%d-%I:%M %p")} />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    </Box>
  );
}

export default ChartComponent