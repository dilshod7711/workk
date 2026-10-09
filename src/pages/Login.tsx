import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { setCookie } from '../utils/cookie';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../features/auth/authApi';
import type { AuthLogin, AuthResponse } from '../features/auth/auth.types';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<AuthLogin>();

  const loginMutation = useMutation<AuthResponse, AxiosError<any>, AuthLogin>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setCookie('token', data.accessToken, 1);
      setCookie('refreshToken', data.refreshToken, 60);
      toast.success("Tizimga muvaffaqiyatli kirdingiz!");
      navigate('/products', { replace: true });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Xatolik yuz berdi");
    }
  });

  const onSubmit = (data: AuthLogin) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex font-sans">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1d2d5b] flex-col justify-center items-center p-12">
        <h1 className="text-5xl font-bold text-white mb-6 text-center leading-tight">
          Xush kelibsiz!
        </h1>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold mb-2 text-slate-900">
              Tizimga kirish
            </h2>
            <p className=" text-slate-500 text-sm  ">Tizimga kirish uchun ma'lumotingizni kiriting</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">
                Username <span className="text-red-500">*</span>
              </label>
              <Input
                id="username"
                type="text"
                {...register('username', { required: true })}
                placeholder="Username ni kiriting"
              />
              {errors.username && <span className="text-xs text-red-500">Username kiritish shart</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                type="password"
                {...register('password', { required: true })}
                placeholder="Parolni kiriting"
              />
              {errors.password && <span className="text-xs text-red-500">Parol kiritish shart</span>}
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-2 w-full"
            >
              {loginMutation.isPending ? "Yuklanmoqda..." : "Kirish"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
