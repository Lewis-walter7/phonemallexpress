'use client';

import { useState } from 'react';
import styles from './trade-in.module.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
    {
        question: "What is the Apple Trade-in program?",
        answer: "The Apple Trade-in program allows you to exchange your eligible Apple device for credit towards your next purchase. It's a great way to save money and reduce electronic waste."
    },
    {
        question: "Which devices are eligible for trade-in?",
        answer: "We accept a wide range of Apple devices including iPhones (iPhone 13 and newer), iPads, Macs, and Apple Watches. Valid Samsung devices are also eligible."
    },
    {
        question: "How do I determine the trade-in value of my device?",
        answer: "You can find an estimated trade-in value by selecting your device model in our trade-in wizard. The final value is confirmed after a physical inspection of the device's condition."
    },
    {
        question: "What condition does my device need to be in for trade-in?",
        answer: "Devices can range from 'Excellent' (flawless) to 'Broken'. However, the value greatly depends on the condition. We accept devices with cracked screens, but they will have a lower trade-in value than those in good condition."
    },
    {
        question: "Can I trade in more than one device at a time?",
        answer: "Yes, you can trade in multiple devices. Please submit a separate request for each device or contact us directly to arrange a bulk trade-in."
    },
    {
        question: "How long is the trade-in process?",
        answer: "Once we inspect your device, the credit is applied instantly towards your new purchase. The inspection process typically takes 15-20 minutes in-store."
    },
    {
        question: "What happens to my personal data when I trade in my device?",
        answer: "We strongly recommend backing up your data and resetting your device before trading it in. However, as part of our process, we ensure all devices are securely wiped of personal data."
    },
    {
        question: "What are the requirements for the trade in?",
        answer: "You must provide a valid ID, and the device must be free of activation locks (e.g., Find My iPhone must be disabled). You must also be the legal owner of the device."
    }
];

export default function TradeInFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={styles.faqContainer}>
            <h2 className={styles.faqHeader}>Questions? Look here.</h2>
            <div className={styles.faqList}>
                {FAQS.map((faq, index) => (
                    <div key={index} className={styles.faqItem}>
                        <button
                            className={styles.faqQuestion}
                            onClick={() => toggle(index)}
                        >
                            <span>{faq.question}</span>
                            {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {openIndex === index && (
                            <div className={styles.faqAnswer}>
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
