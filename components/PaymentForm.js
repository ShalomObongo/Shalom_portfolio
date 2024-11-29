class PaymentForm {
  constructor() {
    this.state = {
      amount: '',
      email: '',
      loading: false,
      error: '',
      isRecurring: false,
      interval: 'daily'
    };

    // Bind methods to this instance
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setState = this.setState.bind(this);
    this.updateUI = this.updateUI.bind(this);
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
  }

  updateUI() {
    // Update form values
    const emailInput = document.getElementById('email');
    const amountInput = document.getElementById('amount');
    const recurringCheckbox = document.getElementById('recurring');
    const intervalSelect = document.getElementById('interval');
    const errorDiv = document.getElementById('error-message');
    const submitButton = document.getElementById('submit-button');
    const intervalContainer = document.getElementById('interval-container');

    if (emailInput) emailInput.value = this.state.email;
    if (amountInput) amountInput.value = this.state.amount;
    if (recurringCheckbox) recurringCheckbox.checked = this.state.isRecurring;
    if (intervalSelect) intervalSelect.value = this.state.interval;
    
    // Update error message
    if (errorDiv) {
      errorDiv.textContent = this.state.error;
      errorDiv.style.display = this.state.error ? 'block' : 'none';
    }

    // Update loading state
    if (submitButton) {
      submitButton.disabled = this.state.loading;
      submitButton.innerHTML = this.state.loading ? `
        <span class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ` : 'Initialize Payment';
    }

    // Show/hide interval selection
    if (intervalContainer) {
      intervalContainer.style.display = this.state.isRecurring ? 'block' : 'none';
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    this.setState({ loading: true, error: '' });

    try {
      const formData = {
        amount: parseFloat(this.state.amount) * 100,
        email: this.state.email,
        isRecurring: this.state.isRecurring,
        interval: this.state.isRecurring ? this.state.interval : undefined,
      };

      console.log('Submitting payment with data:', formData);
      
      const response = await fetch('/api/initialize-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (!data.status || !data.data || !data.data.authorization_url) {
        throw new Error(data.message || 'Invalid response from payment server');
      }

      // Get the redirect URL
      const redirectUrl = data.data.authorization_url;
      console.log('Redirecting to:', redirectUrl);
      
      // Force a hard redirect to the payment page
      window.top.location = redirectUrl;
      
    } catch (err) {
      console.error('Payment error:', err);
      this.setState({ 
        error: err.message || 'An error occurred while processing your payment',
        loading: false 
      });
    }
  }

  render() {
    const formContainer = document.createElement('div');
    formContainer.className = 'max-w-md mx-auto';
    formContainer.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <div class="space-y-2 text-center">
          <h2 class="text-3xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">
            Make Payment
          </h2>
          <p class="text-gray-500 dark:text-gray-400">
            Secure payment processing with Paystack (Supports Mpesa and Card payments)
          </p>
        </div>

        <div id="error-message" class="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm" style="display: none;"></div>

        <form id="payment-form" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              class="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="space-y-2">
            <label for="amount" class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount (KES)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                KES
              </span>
              <input
                type="number"
                id="amount"
                class="w-full pl-14 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white transition-colors"
                placeholder="0.00"
                required
                min="1"
                step="0.01"
              />
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="recurring"
                class="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label for="recurring" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Make this a recurring payment
              </label>
            </div>
          </div>

          <div id="interval-container" class="space-y-2" style="display: none;">
            <label for="interval" class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Billing Interval
            </label>
            <select
              id="interval"
              class="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-white transition-colors"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          <button
            type="submit"
            id="submit-button"
            class="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg 
              hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 
              transition-all duration-200"
          >
            Initialize Payment
          </button>
        </form>
      </div>
    `;

    // Add event listeners
    const form = formContainer.querySelector('#payment-form');
    const emailInput = formContainer.querySelector('#email');
    const amountInput = formContainer.querySelector('#amount');
    const recurringCheckbox = formContainer.querySelector('#recurring');
    const intervalSelect = formContainer.querySelector('#interval');

    // Use the bound methods
    form.addEventListener('submit', this.handleSubmit);
    emailInput.addEventListener('input', (e) => this.setState({ email: e.target.value }));
    amountInput.addEventListener('input', (e) => this.setState({ amount: e.target.value }));
    recurringCheckbox.addEventListener('change', (e) => this.setState({ isRecurring: e.target.checked }));
    intervalSelect.addEventListener('change', (e) => this.setState({ interval: e.target.value }));

    return formContainer;
  }
}

// Export the PaymentForm class
window.PaymentForm = PaymentForm;
