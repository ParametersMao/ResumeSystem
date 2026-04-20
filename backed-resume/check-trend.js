const http = require('http');

const periods = ['day', 'week', 'month'];

periods.forEach(period => {
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/statistics/trend?period=' + period,
    method: 'GET'
  }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const r = JSON.parse(data);
      console.log('=== period=' + period + ' ===');
      console.log('resume_trend:', JSON.stringify(r.data.resume_trend, null, 2));
    });
  });
  req.end();
});