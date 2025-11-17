// Formatação de CEP
        document.getElementById('cep').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.substring(0, 5) + '-' + value.substring(5, 8);
            }
            e.target.value = value;
        });

        // Formatação de telefone
        document.getElementById('telefone').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value.length <= 2) {
                    value = '(' + value;
                } else if (value.length <= 6) {
                    value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
                } else if (value.length <= 10) {
                    value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 6) + '-' + value.substring(6);
                } else {
                    value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
                }
            }
            e.target.value = value;
        });

        // Consulta CEP
        document.getElementById('cep').addEventListener('blur', function(e) {
            const cep = e.target.value.replace(/\D/g, '');
            if (cep.length === 8) {
                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data.erro) {
                            document.getElementById('endereco').value = data.logradouro;
                            document.getElementById('cidade').value = data.localidade;
                            document.getElementById('estado').value = data.uf;
                        }
                    })
                    .catch(error => {
                        console.log('Erro ao consultar CEP:', error);
                    });
            }
        });

        // Upload de avatar
        function triggerFileInput() {
            document.getElementById('avatarInput').click();
        }

        function handleAvatarUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const avatar = document.querySelector('.avatar');
                    avatar.style.backgroundImage = `url(${e.target.result})`;
                    avatar.style.backgroundSize = 'cover';
                    avatar.style.backgroundPosition = 'center';
                    avatar.innerHTML = '<div class="upload-hint">📷</div>';
                };
                reader.readAsDataURL(file);
            }
        }

        // Submit do formulário
        document.getElementById('profileForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular salvamento
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            console.log('Dados do perfil:', data);
            
            // Mostrar mensagem de sucesso
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            
            // Esconder mensagem após 3 segundos
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
            
            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Validação em tempo real
        const inputs = document.querySelectorAll('.form-input, .form-select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.checkValidity()) {
                    this.style.borderColor = '#4CAF50';
                } else {
                    this.style.borderColor = '#f44336';
                }
            });
        });

        // Animação de entrada
        window.addEventListener('load', function() {
            const container = document.querySelector('.profile-container');
            container.style.animation = 'slideIn 0.5s ease';
        });