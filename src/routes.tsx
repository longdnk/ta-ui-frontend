import { Icon } from '@chakra-ui/react';
import {
    MdBarChart,
    MdPerson,
    MdHome,
    MdLock,
    MdOutlineShoppingCart,
    MdDoorbell,
    MdAutoAwesome
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import NFTMarketplace from 'views/admin/marketplace';
import Profile from 'views/admin/profile';
import DataTables from 'views/admin/dataTables';
// Auth Imports
import SignInCentered from 'views/auth/signIn';
import RemoveAuth from "./components/auth/RemoveAuth";
import { clearToken } from "./helper";
import ChatView from "./views/admin/chat";

const routes = [
    {
        name: 'Chat',
        layout: '/admin',
        path: '/chat',
        icon: <Icon as={MdAutoAwesome} width="20px" height="20px" color="inherit"/>,
        component: <ChatView/>,
        show: true,
    },
    {
        name: 'Main Dashboard',
        layout: '/admin',
        path: '/default',
        icon: <Icon as={MdHome} width="20px" height="20px" color="inherit"/>,
        component: <MainDashboard/>,
        show: true,
    },
    {
        name: 'NFT Marketplace',
        layout: '/admin',
        path: '/nft-marketplace',
        icon: (
            <Icon
                as={MdOutlineShoppingCart}
                width="20px"
                height="20px"
                color="inherit"
            />
        ),
        component: <NFTMarketplace/>,
        secondary: true,
        show: true,
    },
    {
        name: 'Data Tables',
        layout: '/admin',
        icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit"/>,
        path: '/data-tables',
        component: <DataTables/>,
        show: true,
    },
    {
        name: 'Profile',
        layout: '/admin',
        path: '/profile',
        icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit"/>,
        component: <Profile/>,
        show: true,
    },
    {
        name: 'Sign In',
        layout: '/auth',
        path: '/sign-in',
        icon: <Icon as={MdLock} width="20px" height="20px" color="inherit"/>,
        component: <SignInCentered/>,
        show: false,
    },
    {
        name: 'Logout',
        layout: '/admin',
        path: '/logout',
        icon: <Icon onClick={clearToken} as={MdDoorbell} width="20px" height="20px" color="inherit"/>,
        component: <RemoveAuth/>,
        show: true,
    },
];

export default routes;