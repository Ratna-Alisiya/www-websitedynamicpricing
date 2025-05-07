let phChart;
const scanHistory = [];

function handleQRCodeScan(decodedText) {
  const productData = JSON.parse(decodedText);
  const pH = productData.pH;
  const temperature = productData.temperature;
  const timestamp = new Date().toLocaleString();

  const qualityElement = document.getElementById("quality");
  const statusElement = document.getElementById("product-status");

  let color = 'brown';
  let status = 'Produk sangat layak, fermentasi normal (pH rendah)';

  if (pH >= 5.5 && pH < 6.0) {
    color = 'brown';
    status = 'Produk masih layak, aktivitas mikroba terkendali.';
  } else if (pH >= 6.0 && pH < 6.5) {
    color = 'orange';
    status = 'Produk masih layak, tetapi mulai mendekati batas.';
  } else if (pH >= 6.5) {
    color = 'yellow';
    status = 'Produk sudah tidak layak, mikroba berkembang pesat.';
  }

  if (pH > 7.0) {
    status = 'Produk sudah tidak layak, pembusukan oleh mikroba pembusuk.';
  }

  qualityElement.style.backgroundColor = color;

  let tempWarning = '';
  if (temperature <= 10) {
    tempWarning = "Suhu rendah hingga normal (4–10°C)";
  } else if (temperature <= 20) {
    tempWarning = "Suhu penyimpanan stabil (10–20°C)";
  } else if (temperature <= 25) {
    tempWarning = "Suhu kamar atau sedikit lebih tinggi (20–25°C)";
  } else {
    tempWarning = "Suhu tinggi atau terpapar sinar matahari langsung (>25°C)";
  }

  statusElement.innerHTML = status + "<br>" + tempWarning;

  updateChart(pH, temperature);

  scanHistory.push({ pH, temperature, status, timestamp });
  updateHistoryTable();
}

function updateChart(pH, temperature) {
  const ctx = document.getElementById('phChart').getContext('2d');
  if (!phChart) {
    phChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['pH', 'Suhu'],
        datasets: [{
          label: 'Nilai',
          data: [pH, temperature],
          backgroundColor: ['#36A2EB', '#FF6384']
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } else {
    phChart.data.datasets[0].data = [pH, temperature];
    phChart.update();
  }
}

function updateHistoryTable() {
  const tableBody = document.getElementById("history-body");
  tableBody.innerHTML = "";
  scanHistory.forEach((item, index) => {
    const row = `<tr>
      <td>${index + 1}</td>
      <td>${item.pH.toFixed(2)}</td>
      <td>${item.temperature} °C</td>
      <td>${item.status}</td>
      <td>${item.timestamp}</td>
    </tr>`;
    tableBody.innerHTML += row;
  });
}

function exportCSV() {
  let csv = "No,pH,Temperature,Status,Timestamp\n";
  scanHistory.forEach((item, index) => {
    csv += `${index + 1},${item.pH},${item.temperature},${item.status},"${item.timestamp}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", "riwayat_scan.csv");
  a.click();
}

function startScanning() {
  const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
    fps: 10,
    qrbox: 250
  });
  html5QrcodeScanner.render(handleQRCodeScan);
}

function generateQR() {
  const r = document.getElementById("r").value;
  const g = document.getElementById("g").value;
  const b = document.getElementById("b").value;

  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    alert("Nilai RGB harus antara 0 dan 255");
    return;
  }

  const avg = (parseInt(r) + parseInt(g) + parseInt(b)) / 3;
  const pH = 4 + (avg / 255) * 4;

  const qr = new QRious({
    element: document.getElementById("qrCanvas"),
    size: 250,
    value: JSON.stringify({
      pH: pH.toFixed(2),
      temperature: 20
    })
  });
}

startScanning();