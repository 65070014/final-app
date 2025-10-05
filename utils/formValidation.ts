import { FormRegisterData } from '@/lib/types';


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

        //บอร์โทรศัพท์ (phone_number)
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

        //ตรวจสอบ บ้านเลขที่ (House Number)
        if (!formData.houseno.trim()) {
            newErrors.houseno = 'กรุณากรอกบ้านเลขที่';
        }

        //ตรวจสอบ ตำบล (Tambon)
        if (!formData.tambon.trim()) {
            newErrors.tambon = 'กรุณากรอกตำบล';
        }

        //ตรวจสอบ อำเภอ (Ampur)
        if (!formData.ampur.trim()) {
            newErrors.ampur = 'กรุณากรอกอำเภอ';
        }

        //ตรวจสอบ จังหวัด (Changwat)
        if (!formData.changwat.trim()) {
            newErrors.changwat = 'กรุณากรอกจังหวัด';
        }

        //ตรวจสอบ เบอร์ติดต่อฉุกเฉิน (Emergency Phone Number)
        const phoneRegex = /^\d{9,10}$/; // อนุญาต 9 หรือ 10 หลักที่เป็นตัวเลขเท่านั้น

        if (!formData.emergency_phone_number.trim()) {
            newErrors.emergency_phone_number = 'กรุณากรอกเบอร์โทรศัพท์ฉุกเฉิน';
        } else if (!phoneRegex.test(formData.emergency_phone_number.trim())) {
            newErrors.emergency_phone_number = 'เบอร์โทรศัพท์ฉุกเฉินไม่ถูกต้อง (9-10 หลัก)';
        }

    }

    if (step === 3) {
        // --- ⚙️ Logic ตรวจสอบ Step 3: ข้อมูลสุขภาพเบื้องต้น ---

        //หมู่เลือด (bloodType)
        if (!formData.bloodType) {
            newErrors.bloodType = 'กรุณาเลือกหมู่เลือด';
        }

        //น้ำหนัก (weight)
        // ต้องเป็นตัวเลขมากกว่า 0
        if (formData.weight <= 0) {
            newErrors.weight = 'กรุณากรอกน้ำหนักที่ถูกต้อง (ต้องมากกว่า 0)';
        }

        //ส่วนสูง (height)
        //ต้องเป็นตัวเลขมากกว่า 0
        if (formData.height <= 0) {
            newErrors.height = 'กรุณากรอกส่วนสูงที่ถูกต้อง (ต้องมากกว่า 0)';
        }

        //ประวัติการแพ้ยา (drugallergy)
        if (!formData.drugallergy.trim()) {
            newErrors.drugallergy = 'กรุณาระบุประวัติการแพ้ยา (ถ้าไม่แพ้ให้กรอก "ไม่มี")';
        }

        //โรคประจำตัว (underlying_disease)
        if (!formData.underlying_disease.trim()) {
            newErrors.underlying_disease = 'กรุณาระบุโรคประจำตัว (ถ้าไม่มีให้กรอก "ไม่มี")';
        }
    }

    return newErrors;
};