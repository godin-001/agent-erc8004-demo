const { runDemo } = require('../src/demo-data');

module.exports = async (req, res) => {
  try {
    const data = await runDemo();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify(data, null, 2));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate demo data', detail: error.message });
  }
};
