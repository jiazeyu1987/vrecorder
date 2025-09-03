-- Adding sample data for testing and development

-- Insert sample users
INSERT INTO users (username, password_hash, full_name, phone, email, role) VALUES
('recorder001', '$2b$10$example_hash', '张护士', '13800138001', 'zhang@example.com', 'recorder'),
('doctor001', '$2b$10$example_hash', '李医生', '13800138002', 'li@example.com', 'doctor'),
('admin001', '$2b$10$example_hash', '王管理员', '13800138003', 'wang@example.com', 'admin');

-- Insert sample service types
INSERT INTO service_types (name, description, duration_minutes, price, category) VALUES
('基础护理', '日常生活护理，包括洗漱、用药提醒等', 60, 80.00, '基础护理'),
('血压测量', '专业血压监测和记录', 30, 50.00, '专业护理'),
('血糖检测', '血糖水平检测和分析', 30, 60.00, '专业护理'),
('康复训练', '物理康复训练指导', 90, 120.00, '康复训练'),
('健康咨询', '健康状况评估和建议', 45, 100.00, '咨询服务');

-- Insert sample families
INSERT INTO families (family_name, address, district, contact_phone, emergency_contact, emergency_phone) VALUES
('李家', '北京市朝阳区建国路88号', '朝阳区', '13800138010', '李小明', '13800138011'),
('王家', '北京市海淀区中关村大街123号', '海淀区', '13800138020', '王小红', '13800138021'),
('张家', '北京市西城区西单大街456号', '西城区', '13800138030', '张小华', '13800138031');

-- Insert sample patients
INSERT INTO patients (family_id, name, gender, birth_date, relationship, medical_conditions, allergies) VALUES
(1, '李老太', '女', '1945-03-15', '户主', '高血压,糖尿病', '青霉素过敏'),
(1, '李大爷', '男', '1943-07-22', '配偶', '冠心病', '无'),
(2, '王奶奶', '女', '1950-11-08', '户主', '关节炎,高血脂', '无'),
(3, '张爷爷', '男', '1948-05-30', '户主', '脑梗后遗症', '磺胺类药物过敏');

-- Insert sample appointments for today and upcoming days
INSERT INTO appointments (patient_id, recorder_id, service_type_id, appointment_date, start_time, status, payment_status, amount) VALUES
(1, 1, 1, CURRENT_DATE, '09:00', 'scheduled', 'paid', 80.00),
(1, 1, 2, CURRENT_DATE, '10:30', 'scheduled', 'pending', 50.00),
(2, 1, 3, CURRENT_DATE, '14:00', 'completed', 'paid', 60.00),
(3, 1, 1, CURRENT_DATE + 1, '09:30', 'scheduled', 'pending', 80.00),
(4, 1, 4, CURRENT_DATE + 1, '15:00', 'scheduled', 'paid', 120.00);

-- Insert sample health records
INSERT INTO health_records (appointment_id, patient_id, recorder_id, service_date, vital_signs, observations, treatments) VALUES
(3, 2, 1, CURRENT_DATE, '{"blood_pressure": "130/85", "heart_rate": 78, "temperature": 36.8, "blood_sugar": 6.2}', '患者精神状态良好，血糖控制稳定', '协助用药，健康指导');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, priority) VALUES
(1, 'appointment_reminder', '今日预约提醒', '您今天有3个预约，请及时查看', 'high'),
(1, 'payment_overdue', '逾期付款提醒', '李老太的血压测量服务费用已逾期3天', 'normal'),
(1, 'system', '系统更新通知', '系统将于今晚22:00进行维护更新', 'low');
