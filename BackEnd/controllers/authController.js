const bcrypt = require('bcryptjs');
const db = require('../config/db');

// 处理登录
exports.login = (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);

    // 查询数据库，验证用户的用户名和密码
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: '数据库查询失败' });
        }
        if (results.length === 0) {
            return res.status(400).json({ error: '用户名不存在' });
        }

        // 比较密码
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: '密码比对失败' });
            }
            if (!isMatch) {
                console.log(user.password, password);
                return res.status(400).json({ error: '密码错误' });
            }

            // 登录成功
            res.status(200).json({ message: '登录成功' });
        });
    });
};

// 注册逻辑
exports.register = (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);
    // 检查用户名是否已存在
    const checkQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(checkQuery, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: '数据库查询失败' });
        }
        if (results.length > 0) {
            // 如果用户名已存在
            return res.status(400).json({ error: '用户名已存在，请重新选择' });
        }

        // 对密码进行加密
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                // console.log(err);
                return res.status(500).json({ error: '密码加密失败' });
            }

            // 将用户信息存入数据库
            const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(insertQuery, [username, hashedPassword], (err, results) => {
                if (err) {
                    return res.status(500).json({ error: '数据库插入失败' });
                }
                res.status(201).json({ message: '注册成功' });
            });
        });
    });
};
