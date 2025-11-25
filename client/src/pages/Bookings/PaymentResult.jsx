import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentResult = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const success = searchParams.get('success') === 'true';

	return (
		<div className="container py-5" style={{ minHeight: '50vh' }}>
			<div className="row justify-content-center">
				<div className="col-md-8">
					<div className="text-center p-4 border rounded-3 shadow-sm bg-white">
						{success ? (
							<h3 className="mb-3 text-success">Cảm ơn bạn đã đặt dịch vụ của chúng tui</h3>
						) : (
							<h3 className="mb-3 text-danger">Thanh toán không thành công</h3>
						)}
						<button
							className="btn btn-danger mt-2"
							onClick={() => navigate('/services')}
						>
							Tiếp tục đặt dịch vụ
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PaymentResult;
