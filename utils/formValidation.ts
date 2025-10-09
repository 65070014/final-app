import { FormRegisterData,VitalSign } from '@/lib/types';


export const validateRegisterStep = (step: number, formData: FormRegisterData): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
        //หมายเลขบัตรประชาชน (id)
        const idRegex = /^\d{13}$/;
        if (!formData.id || !idRegex.test(formData.id)) {
            newErrors.id = 'กรุณากรอกหมายเลขบัตรประชาชน 13 หลักให้ถูกต้อง';
        }
        //ชื่อ (firstName)
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'กรุณากรอกชื่อจริง';
        }
        //นามสกุล (lastName)
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'กรุณากรอกนามสกุล';
        }
        //พศ (gender)
        if (!formData.gender) {
            newErrors.gender = 'กรุณาเลือกเพศ';
        }
        //วันเดือนปีเกิด (dob)
        if (!formData.dob) {
            newErrors.dob = 'กรุณาเลือกวันเดือนปีเกิด';
        }
        //สัญชาติ (nation)
        if (!formData.nation.trim()) {
            newErrors.nation = 'กรุณาระบุสัญชาติ';
        }
        //อาชีพ (occupation)
        if (!formData.occupation.trim()) {
            newErrors.occupation = 'กรุณาระบุอาชีพ';
        }
        //เบอร์โทรศัพท์ (phone_number)
        const phoneRegex = /^\d{9,10}$/;
        if (!formData.phone_number.trim() || !phoneRegex.test(formData.phone_number.trim())) {
            newErrors.phone_number = 'เบอร์โทรศัพท์ไม่ถูกต้อง (9-10 หลัก)';
        }
        //อีเมล (email)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
            newErrors.email = 'กรุณากรอกอีเมลในรูปแบบที่ถูกต้อง';
        }
        //รหัสผ่าน (password)
        if (formData.password.length < 8) {
            newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
        }

        //ยืนยันรหัสผ่าน (confirm_password)
        if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
        }
    }

    if (step === 2) {
        //ตรวจสอบ บ้านเลขที่
        if (!formData.houseno.trim()) {
            newErrors.houseno = 'กรุณากรอกบ้านเลขที่';
        }
        //ตรวจสอบ ตำบล
        if (!formData.tambon.trim()) {
            newErrors.tambon = 'กรุณากรอกตำบล';
        }
        //ตรวจสอบ อำเภอ
        if (!formData.ampur.trim()) {
            newErrors.ampur = 'กรุณากรอกอำเภอ';
        }
        //ตรวจสอบ จังหวัด
        if (!formData.changwat.trim()) {
            newErrors.changwat = 'กรุณากรอกจังหวัด';
        }
        //ตรวจสอบ เบอร์ติดต่อฉุกเฉิน
        const phoneRegex = /^\d{9,10}$/;

        if (!formData.emergency_phone_number.trim()) {
            newErrors.emergency_phone_number = 'กรุณากรอกเบอร์โทรศัพท์ฉุกเฉิน';
        } else if (!phoneRegex.test(formData.emergency_phone_number.trim())) {
            newErrors.emergency_phone_number = 'เบอร์โทรศัพท์ฉุกเฉินไม่ถูกต้อง (9-10 หลัก)';
        }

    }

    if (step === 3) {

        //หมู่เลือด
        if (!formData.bloodType) {
            newErrors.bloodType = 'กรุณาเลือกหมู่เลือด';
        }
        //น้ำหนัก
        if (formData.weight <= 0) {
            newErrors.weight = 'กรุณากรอกน้ำหนักที่ถูกต้อง (ต้องมากกว่า 0)';
        }
        //ส่วนสูง
        if (formData.height <= 0) {
            newErrors.height = 'กรุณากรอกส่วนสูงที่ถูกต้อง (ต้องมากกว่า 0)';
        }
        //ประวัติการแพ้ยา
        if (!formData.drugallergy.trim()) {
            newErrors.drugallergy = 'กรุณาระบุประวัติการแพ้ยา (ถ้าไม่แพ้ให้กรอก "ไม่มี")';
        }
        //โรคประจำตัว
        if (!formData.underlying_disease.trim()) {
            newErrors.underlying_disease = 'กรุณาระบุโรคประจำตัว (ถ้าไม่มีให้กรอก "ไม่มี")';
        }
    }
    return newErrors;
};

export const validateVitalSigns = (formData: VitalSign): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};
    //ค่า SBP
    if (formData.sbp < 60 || formData.sbp > 250) {
        newErrors.sbp = "ค่า SBP (ตัวบน) ต้องอยู่ระหว่าง 60-250 mmHg";
    }

    //ค่า DBP
    if (formData.dbp < 40 || formData.dbp > 150) {
        newErrors.dbp = "ค่า DBP (ตัวล่าง) ต้องอยู่ระหว่าง 40-150 mmHg";

    }
    if (formData.dbp >= formData.sbp) {
        newErrors.diastolic_2 = "ค่า DBP ต้องน้อยกว่าค่า SBP";
    }

    // อัตราการเต้นของหัวใจ
    if (formData.pr < 30 || formData.pr > 200) {
        newErrors.pr = "ค่า อัตราการเต้นของหัวใจ ต้องอยู่ระหว่าง 30-200 ครั้ง/นาที";
    }

    // อัตราการหายใจ
    if (formData.rr < 5 || formData.rr > 40) {
        newErrors.rr = "ค่า อัตราการหายใจ ต้องอยู่ระหว่าง 5-40 ครั้ง/นาที";
    }

    // อุณหภูมิ
    if (formData.temperature < 30 || formData.temperature > 43) {
        newErrors.temperature = "อุณหภูมิต้องอยู่ระหว่าง 30.0-43.0 °C";
    }

    // น้ำหนัก
    if (formData.weight <= 0 || formData.weight > 300) {
        newErrors.weight = "น้ำหนักตัวต้องเป็นค่าบวกและไม่เกิน 300 kg";
    }
    
    // ส่วนสูง
    if (formData.height <= 0 || formData.height > 250) {
        newErrors.height = "ส่วนสูงต้องเป็นค่าบวกและไม่เกิน 250 cm";
    }
    return newErrors;
};