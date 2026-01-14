document.addEventListener('DOMContentLoaded', function() {
    const homePriceInput = document.getElementById('homePrice');
    const downPaymentInput = document.getElementById('downPayment');
    const loanTermSelect = document.getElementById('loanTerm');
    const interestRateInput = document.getElementById('interestRate');
    const propertyTaxInput = document.getElementById('propertyTax');
    const homeInsuranceInput = document.getElementById('homeInsurance');
    const hoaFeesInput = document.getElementById('hoaFees');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultContainer = document.getElementById('result');

    // Update down payment percentage display
    homePriceInput.addEventListener('input', updateDownPaymentPercent);
    downPaymentInput.addEventListener('input', updateDownPaymentPercent);

    function updateDownPaymentPercent() {
        const homePrice = parseFloat(homePriceInput.value) || 0;
        const downPayment = parseFloat(downPaymentInput.value) || 0;
        const percent = homePrice > 0 ? (downPayment / homePrice * 100).toFixed(1) : 0;
        document.getElementById('downPaymentPercent').textContent = `${percent}% of home price`;
    }

    calculateBtn.addEventListener('click', calculateMortgage);
    resetBtn.addEventListener('click', resetCalculator);

    // Calculate on Enter key
    [homePriceInput, downPaymentInput, interestRateInput].forEach(input => {
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') calculateMortgage();
        });
    });

    function calculateMortgage() {
        const homePrice = parseFloat(homePriceInput.value);
        const downPayment = parseFloat(downPaymentInput.value);
        const loanTerm = parseInt(loanTermSelect.value);
        const annualRate = parseFloat(interestRateInput.value);
        const annualTax = parseFloat(propertyTaxInput.value) || 0;
        const annualInsurance = parseFloat(homeInsuranceInput.value) || 0;
        const monthlyHOA = parseFloat(hoaFeesInput.value) || 0;

        // Validation
        if (!homePrice || homePrice <= 0) {
            alert('Please enter a valid home price');
            return;
        }

        if (downPayment < 0 || downPayment >= homePrice) {
            alert('Down payment must be between $0 and home price');
            return;
        }

        if (!annualRate || annualRate <= 0) {
            alert('Please enter a valid interest rate');
            return;
        }

        // Calculate loan amount
        const loanAmount = homePrice - downPayment;
        
        // Calculate monthly payment (Principal & Interest)
        const monthlyRate = annualRate / 100 / 12;
        const numPayments = loanTerm * 12;
        
        let monthlyPI;
        if (monthlyRate === 0) {
            monthlyPI = loanAmount / numPayments;
        } else {
            monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
        }

        // Calculate other monthly costs
        const monthlyTax = annualTax / 12;
        const monthlyInsurance = annualInsurance / 12;

        // Total monthly payment
        const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA;

        // Total amounts
        const totalInterest = (monthlyPI * numPayments) - loanAmount;
        const totalPaid = monthlyPI * numPayments;

        // Display results
        document.getElementById('totalPayment').textContent = formatCurrency(totalMonthly);
        document.getElementById('principalInterest').textContent = formatCurrency(monthlyPI);
        document.getElementById('monthlyTax').textContent = formatCurrency(monthlyTax);
        document.getElementById('monthlyInsurance').textContent = formatCurrency(monthlyInsurance);
        document.getElementById('monthlyHOA').textContent = formatCurrency(monthlyHOA);
        document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
        document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
        document.getElementById('totalPaid').textContent = formatCurrency(totalPaid);

        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Save to localStorage
        saveCalculation({
            homePrice, downPayment, loanTerm, annualRate,
            totalMonthly, loanAmount, totalInterest
        });
    }

    function formatCurrency(amount) {
        return '$' + Math.round(amount).toLocaleString('en-US');
    }

    function resetCalculator() {
        homePriceInput.value = '300000';
        downPaymentInput.value = '60000';
        loanTermSelect.value = '30';
        interestRateInput.value = '6.5';
        propertyTaxInput.value = '3000';
        homeInsuranceInput.value = '1200';
        hoaFeesInput.value = '0';
        resultContainer.style.display = 'none';
        updateDownPaymentPercent();
    }

    function saveCalculation(data) {
        const history = JSON.parse(localStorage.getItem('mortgage_history') || '[]');
        history.push({
            ...data,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US')
        });
        if (history.length > 20) history.shift();
        localStorage.setItem('mortgage_history', JSON.stringify(history));
    }

    // Initialize
    updateDownPaymentPercent();
});
