const db = require('../config/db');

/**
 * 生成随机状态数据
 * @returns {Object} 包含压力、温度、高度、速度和状态的对象
 */
const generateStatusData = () => {
    const pressure = Math.floor(Math.random() * 2000) + 'Pa'; // 随机压力
    const temperature = (Math.random() * 10 + 5).toFixed(1) + '°C'; // 随机温度
    const altitude = Math.floor(Math.random() * 100) + 'm'; // 随机高度
    const speed = (Math.random() * 5).toFixed(1) + 'm/s'; // 随机速度
    const status = Math.random() > 0.5 ? '正常' : '异常'; // 随机状态

    return { pressure, temperature, altitude, speed, status };
};

/**
 * 将状态数据存储到数据库
 * @param {Object} data 包含压力、温度、高度、速度和状态的对象
 */
const storeStatusData = (data) => {
    const { pressure, temperature, altitude, speed, status } = data;
    const query = 'INSERT INTO status_data (pressure, temperature, altitude, speed, status) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [pressure, temperature, altitude, speed, status], (err, result) => {
        if (err) {
            console.error('插入数据失败:', err);
        } else {
            console.log('成功生成并存储状态数据');
        }
    });
};

/**
 * 生成并存储状态数据
 */
const generateAndStoreStatusData = () => {
    const data = generateStatusData();
    storeStatusData(data);
};

module.exports = {
    generateStatusData,
    storeStatusData,
    generateAndStoreStatusData,
};